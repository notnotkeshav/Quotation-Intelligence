# Copyright (c) 2026, Keshav Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class QIAIProvider(Document):
	def before_save(self):
		# Enforce single active provider
		if self.is_active:
			frappe.db.sql(
				"UPDATE `tabQI AI Provider` SET is_active=0 WHERE name != %s",
				(self.name,)
			)

	def validate(self):
		if not self.api_key:
			frappe.throw("API Key is required")

