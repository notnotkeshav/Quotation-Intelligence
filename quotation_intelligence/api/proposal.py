# quotation_intelligence/api/proposal.py

import frappe, json
from frappe.utils import now_datetime


def _serialize_proposal(data):
    """Build the JSON blob stored in proposal_json field."""
    skip = {"form_data", "status", "frappe_name", "doctype"}
    return json.dumps({k: v for k, v in data.items() if k not in skip})


@frappe.whitelist()
def save(doc):
    data = frappe.parse_json(doc)
    proposal_json = _serialize_proposal(data)

    form_data = data.get("form_data", {})
    if isinstance(form_data, str):
        try:
            form_data = json.loads(form_data)
        except Exception:
            form_data = {}

    crm_source = form_data.get("crm_source") or {}

    # ── Update existing ──────────────────────────────────────────
    if data.get("frappe_name") and frappe.db.exists("QI Proposal", data["frappe_name"]):
        doc_obj = frappe.get_doc("QI Proposal", data["frappe_name"])
        doc_obj.proposal_title  = data.get("proposal_title", doc_obj.proposal_title)
        doc_obj.client_name     = data.get("client_name",    doc_obj.client_name)
        doc_obj.total_value     = data.get("total_value",    doc_obj.total_value)
        doc_obj.currency        = data.get("currency",       doc_obj.currency)
        doc_obj.status          = data.get("status",         doc_obj.status)
        doc_obj.proposal_json   = proposal_json
        doc_obj.form_data_json  = json.dumps(form_data)
        doc_obj.save(ignore_permissions=True)
        frappe.db.commit()
        return {"name": doc_obj.name}

    # ── Insert new ───────────────────────────────────────────────
    new_doc = frappe.get_doc({
        "doctype":        "QI Proposal",
        "proposal_title": data.get("proposal_title", "Untitled Proposal"),
        "client_name":    data.get("client_name", ""),
        "industry":       form_data.get("industry", ""),
        "currency":       data.get("currency", "USD"),
        "total_value":    data.get("total_value", 0),
        "status":         data.get("status", "Draft"),
        "prepared_by":    data.get("prepared_by", frappe.session.user),
        "valid_until":    form_data.get("valid_until"),
        "contact_name":   form_data.get("contact_name"),
        "contact_email":  form_data.get("contact_email"),
        "contact_phone":  form_data.get("contact_phone"),
        "lead": (
            crm_source.get("name")
            if crm_source.get("source_type") == "lead" else None
        ),
        "opportunity": (
            crm_source.get("name")
            if crm_source.get("source_type") == "opportunity" else None
        ),
        "proposal_json":  proposal_json,
        "form_data_json": json.dumps(form_data),
    })
    new_doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": new_doc.name}


@frappe.whitelist()
def get(name):
    doc = frappe.get_doc("QI Proposal", name)
    result = doc.as_dict()
    if doc.proposal_json:
        try:
            result["proposal"] = json.loads(doc.proposal_json)
        except Exception:
            pass
    if doc.form_data_json:
        try:
            result["form_data"] = json.loads(doc.form_data_json)
        except Exception:
            pass
    if doc.sections_viewed:
        try:
            result["sections_viewed"] = json.loads(doc.sections_viewed)
        except Exception:
            result["sections_viewed"] = []
    return result


@frappe.whitelist()
def get_list(filters="{}"):
    f = json.loads(filters) if isinstance(filters, str) else (filters or {})
    return frappe.get_list(
        "QI Proposal",
        filters=f,
        fields=[
            "name", "proposal_title", "client_name", "industry",
            "total_value", "currency", "status", "valid_until",
            "view_count", "total_time_on_page", "creation", "modified",
        ],
        order_by="creation desc",
        limit=50,
    )


@frappe.whitelist(allow_guest=True)
def log_event(proposal_name, event):
    """
    Unauthenticated behaviour tracking endpoint.
    allow_guest=True so the client-facing proposal URL can POST without login.
    Rate-limiting should be handled at the nginx / proxy level.
    """
    if not frappe.db.exists("QI Proposal", proposal_name):
        return {"ok": False, "error": "Not found"}

    data = frappe.parse_json(event) if isinstance(event, str) else event

    frappe.get_doc({
        "doctype":    "QI Event Log",
        "proposal":   proposal_name,
        "event_type": data.get("event_type"),
        "section_id": data.get("section_id"),
        "value":      str(data.get("value", "")),
        "session_id": data.get("session_id"),
        "timestamp":  data.get("timestamp") or str(now_datetime()),
        "extra":      json.dumps(data.get("extra") or {}),
    }).insert(ignore_permissions=True)

    # ── Aggregate into the proposal header ──────────────────────
    proposal = frappe.get_doc("QI Proposal", proposal_name)
    etype = data.get("event_type")

    if etype == "page_open":
        proposal.view_count = (proposal.view_count or 0) + 1
        if not proposal.viewed_at:
            proposal.viewed_at = now_datetime()
        if proposal.status == "Sent":
            proposal.status = "Viewed"

    elif etype == "time_on_section":
        try:
            secs = int(float(data.get("value") or 0))
        except (TypeError, ValueError):
            secs = 0
        proposal.total_time_on_page = (proposal.total_time_on_page or 0) + secs

    elif etype == "section_view":
        viewed = []
        if proposal.sections_viewed:
            try:
                viewed = json.loads(proposal.sections_viewed)
            except Exception:
                viewed = []
        sid = data.get("section_id")
        if sid and sid not in viewed:
            viewed.append(sid)
            proposal.sections_viewed = json.dumps(viewed)
        proposal.last_section = sid

    elif etype == "accept":
        proposal.status = "Accepted"
        proposal.accepted_at = now_datetime()

    elif etype == "negotiate":
        proposal.status = "Negotiating"

    proposal.save(ignore_permissions=True)
    frappe.db.commit()
    return {"ok": True}


@frappe.whitelist()
def update_status(name, status):
    allowed = {"Draft", "Sent", "Viewed", "Negotiating", "Accepted", "Rejected", "Expired"}
    if status not in allowed:
        frappe.throw(f"Invalid status: {status}")
    frappe.db.set_value("QI Proposal", name, "status", status)
    if status == "Sent":
        frappe.db.set_value("QI Proposal", name, "sent_on", now_datetime())
    frappe.db.commit()
    return {"ok": True}
