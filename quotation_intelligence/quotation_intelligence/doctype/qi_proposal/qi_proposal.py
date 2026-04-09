# Copyright (c) 2026, Keshav Kumar and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class QIProposal(Document):
	def before_submit(self):
		if self.status == "Draft":
			self.status = "Sent"
			self.sent_on = now_datetime()

	def validate(self):
		if not self.proposal_title:
			frappe.throw("Proposal Title is required")
		if not self.client_name:
			frappe.throw("Client Name is required")

		# Auto-expire
		if self.valid_until and self.status not in ("Accepted", "Rejected", "Expired"):
			if getdate(self.valid_until) < getdate(today()):
				self.status = "Expired"

	def on_submit(self):
		# Link back to Opportunity if present
		if self.opportunity:
			try:
				opp = frappe.get_doc("Opportunity", self.opportunity)
				opp.status = "Proposal/Price Quote"
				opp.save(ignore_permissions=True)
			except Exception:
				pass

	def get_public_url(self):
		"""Returns the shareable URL for client-facing proposal view."""
		base = frappe.utils.get_url()
		return f"{base}/qi/proposal/{self.name}"
