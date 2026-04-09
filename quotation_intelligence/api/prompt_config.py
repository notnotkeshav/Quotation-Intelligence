# quotation_intelligence/api/prompt_config.py
# industry_id is a Link to Industry Type — values are the Industry Type name strings
# e.g. "Manufacturing", "Healthcare", not slugs like "manufacturing"

import frappe, json


def _parse_json_fields(doc):
    """Parse JSON string fields into Python lists for API consumers."""
    for f in ["enabled_sections", "section_order", "focus_areas", "restrictions"]:
        val = doc.get(f)
        if val and isinstance(val, str):
            try:
                doc[f] = json.loads(val)
            except (json.JSONDecodeError, ValueError):
                doc[f] = []
    return doc


@frappe.whitelist()
def get_list(industry_id=None):
    filters = {}
    if industry_id:
        filters["industry_id"] = industry_id

    docs = frappe.get_list(
        "QI Prompt Config",
        filters=filters,
        fields=[
            "name", "industry_id", "version_label", "is_default", "tone",
            "primary_color", "accent_color",
            "enabled_sections", "section_order", "focus_areas",
            "custom_instructions", "restrictions",
        ],
        order_by="is_default desc, creation asc",
    )
    return [_parse_json_fields(dict(d)) for d in docs]


@frappe.whitelist()
def get(name):
    doc = frappe.get_doc("QI Prompt Config", name).as_dict()
    return _parse_json_fields(doc)


@frappe.whitelist()
def save(doc):
    data = frappe.parse_json(doc) if isinstance(doc, str) else doc

    # Serialize list fields to JSON strings for storage
    for f in ["enabled_sections", "section_order", "focus_areas", "restrictions"]:
        if isinstance(data.get(f), list):
            data[f] = json.dumps(data[f])

    name = data.get("name")
    if name and frappe.db.exists("QI Prompt Config", name):
        existing = frappe.get_doc("QI Prompt Config", name)
        skip = {"name", "doctype", "creation", "modified", "modified_by", "owner"}
        for k, v in data.items():
            if k not in skip:
                existing.set(k, v)
        existing.save(ignore_permissions=True)
        result_name = existing.name
    else:
        data.pop("name", None)
        data.pop("doctype", None)
        new_doc = frappe.get_doc({"doctype": "QI Prompt Config", **data})
        new_doc.insert(ignore_permissions=True)
        result_name = new_doc.name

    # Enforce single default per industry
    if data.get("is_default"):
        frappe.db.sql(
            "UPDATE `tabQI Prompt Config` SET is_default=0 WHERE industry_id=%s AND name!=%s",
            (data.get("industry_id"), result_name)
        )
        frappe.db.commit()

    return {"name": result_name}


@frappe.whitelist()
def delete_doc(name):
    frappe.delete_doc("QI Prompt Config", name, ignore_permissions=True)
    frappe.db.commit()
    return {"ok": True}


@frappe.whitelist()
def set_default(name):
    doc = frappe.get_doc("QI Prompt Config", name)
    frappe.db.sql(
        "UPDATE `tabQI Prompt Config` SET is_default=0 WHERE industry_id=%s",
        (doc.industry_id,)
    )
    doc.is_default = 1
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"ok": True}
