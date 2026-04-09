import frappe
from quotation_intelligence.www.proposal.context import get_csrf_token, get_boot

no_cache = 1

def get_context(context):
    if frappe.session.user == "Guest":
        frappe.throw("Please log in first", frappe.PermissionError)
    context.csrf_token = get_csrf_token()
    context.boot = get_boot()
