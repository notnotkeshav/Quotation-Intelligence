# quotation_intelligence/api/ai_provider.py
# Matches live QI AI Provider doctype fields:
#   provider_id, api_key (Password), model_id, base_url,
#   model_endpoint, auth_header, is_active, notes

import frappe, json


@frappe.whitelist()
def get_list():
    """Returns all providers — excludes api_key for security."""
    return frappe.get_list(
        "QI AI Provider",
        fields=["name", "provider_id", "model_id", "is_active",
                "base_url", "model_endpoint", "auth_header", "notes"],
        order_by="is_active desc, creation asc",
    )


@frappe.whitelist()
def get_active():
    """Returns the active provider config including decrypted API key."""
    name = frappe.db.get_value("QI AI Provider", {"is_active": 1}, "name")
    if not name:
        return None
    doc = frappe.get_doc("QI AI Provider", name)
    return {
        "name":           doc.name,
        "provider_id":    doc.provider_id,
        "api_key":        doc.get_password("api_key"),
        "model_id":       doc.model_id,
        "base_url":       doc.base_url,
        "model_endpoint": doc.model_endpoint,
        "auth_header":    doc.auth_header,
    }


@frappe.whitelist()
def save(doc):
    data = frappe.parse_json(doc)

    # Deactivate all others if setting this one active
    if data.get("is_active"):
        frappe.db.set_value(
            "QI AI Provider", {"is_active": 1}, "is_active", 0,
            update_modified=False,
        )

    if data.get("name") and frappe.db.exists("QI AI Provider", data["name"]):
        existing = frappe.get_doc("QI AI Provider", data["name"])
        for field in ["provider_id", "model_id", "base_url", "model_endpoint",
                      "auth_header", "is_active", "notes"]:
            if field in data:
                existing.set(field, data[field])
        if data.get("api_key"):
            existing.api_key = data["api_key"]
        existing.save(ignore_permissions=True)
        frappe.db.commit()
        return {"name": existing.name}

    new_doc = frappe.get_doc({
        "doctype":        "QI AI Provider",
        "provider_id":    data.get("provider_id", ""),
        "api_key":        data.get("api_key", ""),
        "model_id":       data.get("model_id", ""),
        "base_url":       data.get("base_url", ""),
        "model_endpoint": data.get("model_endpoint", ""),
        "auth_header":    data.get("auth_header", "Authorization"),
        "is_active":      data.get("is_active", 0),
        "notes":          data.get("notes", ""),
    })
    new_doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": new_doc.name}


@frappe.whitelist()
def delete_doc(name):
    frappe.delete_doc("QI AI Provider", name, ignore_permissions=True)
    frappe.db.commit()
    return {"ok": True}
