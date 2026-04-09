# quotation_intelligence/api/crm.py
# Field names match live Lead and Opportunity doctypes exactly.

import frappe


@frappe.whitelist()
def search_leads(query=""):
    """
    Lead fields used: name, lead_name, company_name, industry (Link→Industry Type),
    status, email_id, mobile_no, country
    """
    like = f"%{query}%"
    return frappe.db.sql("""
        SELECT name, lead_name, company_name, industry,
               status, email_id, mobile_no, country
        FROM `tabLead`
        WHERE docstatus < 2
          AND (lead_name LIKE %(q)s OR company_name LIKE %(q)s OR email_id LIKE %(q)s)
        ORDER BY modified DESC
        LIMIT 25
    """, {"q": like}, as_dict=True)


@frappe.whitelist()
def search_opportunities(query=""):
    """
    Opportunity fields: name, opportunity_from (Lead/Customer), party_name (Dynamic Link),
    customer_name (read-only display), status, opportunity_amount, currency, probability
    """
    like = f"%{query}%"
    results = frappe.db.sql("""
        SELECT name, opportunity_from, party_name, customer_name,
               status, opportunity_amount, currency, probability,
               contact_email, expected_closing
        FROM `tabOpportunity`
        WHERE docstatus < 2
          AND (party_name LIKE %(q)s OR customer_name LIKE %(q)s)
        ORDER BY modified DESC
        LIMIT 25
    """, {"q": like}, as_dict=True)
    for r in results:
        r["display_name"] = r.get("customer_name") or r.get("party_name") or r["name"]
    return results


@frappe.whitelist()
def get_lead(name):
    doc = frappe.get_doc("Lead", name)
    return {
        "name":             doc.name,
        "lead_name":        doc.lead_name,
        "company_name":     doc.company_name,
        "industry":         doc.industry,       # Link to Industry Type — returns name string
        "status":           doc.status,
        "email_id":         doc.email_id,
        "mobile_no":        doc.mobile_no,
        "phone":            doc.phone,
        "website":          doc.website,
        "city":             doc.city,
        "state":            doc.state,
        "country":          str(doc.country) if doc.country else "",
        "no_of_employees":  doc.no_of_employees,
        "annual_revenue":   doc.annual_revenue,
        "notes":            doc.notes,
        "source":           doc.source,
        "territory":        doc.territory,
    }


@frappe.whitelist()
def get_opportunity(name):
    doc = frappe.get_doc("Opportunity", name)
    return {
        "name":               doc.name,
        "opportunity_from":   doc.opportunity_from,   # "Lead" or "Customer"
        "party_name":         doc.party_name,          # Dynamic link value
        "customer_name":      doc.customer_name,       # Populated read-only field
        "status":             doc.status,
        "opportunity_amount": doc.opportunity_amount,
        "currency":           doc.currency,
        "probability":        doc.probability,
        "expected_closing":   str(doc.expected_closing) if doc.expected_closing else None,
        "industry":           doc.industry,
        "country":            str(doc.country) if doc.country else "",
        "city":               doc.city,
        "contact_email":      doc.contact_email,
        "contact_mobile":     doc.contact_mobile,
        "phone":              doc.phone,
        "notes":              doc.notes,
        "source":             doc.source,
    }


@frappe.whitelist()
def get_customer(name):
    doc = frappe.get_doc("Customer", name)
    return {
        "name":           doc.name,
        "customer_name":  doc.customer_name,
        "industry":       getattr(doc, "industry", ""),
        "customer_group": doc.customer_group,
        "territory":      doc.territory,
        "website":        getattr(doc, "website", ""),
    }
