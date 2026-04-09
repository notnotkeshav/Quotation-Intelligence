# quotation_intelligence/quotation_intelligence/page/quotation_builder/quotation_builder.py

import frappe

def get_context(context):
    context.no_cache = 1
    context.show_sidebar = False
    return context
