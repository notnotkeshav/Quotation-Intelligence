import frappe
import json

no_cache = 1


def get_context(context):
    proposal_name = frappe.form_dict.get("name")

    if not proposal_name:
        frappe.throw("Proposal name is required")

    doc = frappe.get_doc("QI Proposal", proposal_name)

    raw = {}
    if doc.proposal_json:
        try:
            raw = json.loads(doc.proposal_json)
        except Exception:
            raw = {}

    ui = transform(raw, doc)

    context.ui = ui
    context.proposal_name = doc.name
    context.no_cache = 1
    context.show_sidebar = False


def transform(raw, doc):
    sections = raw.get("sections", [])

    def find(t):
        return next((s for s in sections if s.get("type") == t), {})

    pricing = find("pricing")
    timeline = find("timeline")

    return {
        "meta": {
            "client_name": doc.client_name,
            "vendor_name": doc.prepared_by or "Extension ERP",
            "date": str(doc.valid_until) if doc.valid_until else "",
            "email": getattr(doc, "contact_email", ""),
            "phone": getattr(doc, "contact_phone", ""),
        },

        "hero": {
            "project_type": doc.proposal_title or "Proposal",
            "tagline": "Digital transformation engagement",
            "stats": {
                "days": timeline.get("total_weeks", 0) * 7 if timeline else 0,
                "phases": len(timeline.get("phases", [])) if timeline else 0,
                "man_days": 45,
                "modules": len(sections),
                "total_cost": pricing.get("total", 0),
            }
        },

        "objective": extract_objectives(sections),
        "scope": extract_scope(sections),
        "timeline": timeline.get("phases", []),
        "pricing": pricing.get("pricing_items", []),
    }


def extract_objectives(sections):
    out = []
    for s in sections:
        if s.get("id") == "objectives":
            for line in (s.get("content") or "").split("\n"):
                if line.strip():
                    out.append({
                        "title": line.strip(),
                        "desc": ""
                    })
    return out


def extract_scope(sections):
    out = []
    for s in sections:
        if s.get("type") == "text":
            out.append({
                "module": s.get("title"),
                "items": (s.get("content") or "").split("\n")
            })
    return out