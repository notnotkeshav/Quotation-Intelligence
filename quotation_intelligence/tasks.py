# quotation_intelligence/tasks.py

import frappe
from frappe.utils import today, getdate


def expire_proposals():
    """
    Scheduled daily. Moves any Sent/Viewed proposals past their valid_until
    date to Expired status.  Skips Accepted, Rejected, Draft, Expired.
    """
    today_date = getdate(today())

    stale = frappe.db.sql(
        """
        SELECT name FROM `tabQI Proposal`
        WHERE status IN ('Sent', 'Viewed', 'Negotiating')
          AND valid_until IS NOT NULL
          AND valid_until < %s
          AND docstatus < 2
        """,
        (today_date,),
        as_dict=True,
    )

    if not stale:
        return

    names = [r["name"] for r in stale]
    frappe.db.sql(
        f"UPDATE `tabQI Proposal` SET status='Expired' WHERE name IN ({','.join(['%s']*len(names))})",
        names,
    )
    frappe.db.commit()
    frappe.logger().info(f"[QI] Expired {len(names)} proposals: {names}")
