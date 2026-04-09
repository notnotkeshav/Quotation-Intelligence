# www/qi/proposal.py
# Serves /qi/proposal/<n>  — the client-facing proposal view.
# allow_guest so clients can open a link without a Frappe account.

import frappe
import json

no_cache = 1


def get_context(context):
    # `n` is injected by website_route_rules from the URL segment
    proposal_name = frappe.form_dict.get("n") or frappe.form_dict.get("name")

    if not proposal_name:
        frappe.throw("Proposal name is required", frappe.InvalidRequestError)

    # Fetch the proposal doc
    try:
        doc = frappe.get_doc("QI Proposal", proposal_name)
    except frappe.DoesNotExistError:
        frappe.throw(f"Proposal '{proposal_name}' not found", frappe.DoesNotExistError)

    # Parse the stored JSON
    proposal_data = {}
    if doc.proposal_json:
        try:
            proposal_data = json.loads(doc.proposal_json)
        except (json.JSONDecodeError, ValueError):
            pass

    # Merge doc header fields into proposal_data for the template
    proposal_data.update(
        {
            "frappe_name": doc.name,
            "proposal_title": doc.proposal_title,
            "client_name": doc.client_name,
            "status": doc.status,
            "valid_until": str(doc.valid_until) if doc.valid_until else None,
            "currency": doc.currency or "USD",
            "total_value": doc.total_value or 0,
            "prepared_by": doc.prepared_by,
            "contact_email": getattr(doc, "contact_email", None),
            "contact_phone": getattr(doc, "contact_phone", None),
        }
    )

    context.proposal = proposal_data
    context.proposal_json = json.dumps(proposal_data)
    context.proposal_name = doc.name
    context.doc = doc
    context.no_cache = 1
    context.show_sidebar = False

    # Log the page open event (best-effort, non-blocking)
    try:
        _log_open(doc.name)
    except Exception:
        pass


def _log_open(proposal_name):
    """Increment view count and set first-viewed timestamp."""
    import frappe.utils

    doc = frappe.get_doc("QI Proposal", proposal_name)
    doc.view_count = (doc.view_count or 0) + 1
    if not doc.viewed_at:
        doc.viewed_at = frappe.utils.now_datetime()
    if doc.status == "Sent":
        doc.status = "Viewed"
    doc.save(ignore_permissions=True)
    frappe.db.commit()
