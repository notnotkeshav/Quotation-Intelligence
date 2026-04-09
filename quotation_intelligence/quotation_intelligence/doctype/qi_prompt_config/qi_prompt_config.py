# Copyright (c) 2026, Keshav Kumar and contributors
# For license information, please see license.txt

import frappe, json
from frappe.model.document import Document


class QIPromptConfig(Document):
	def before_save(self):
		# Enforce single default per industry
		if self.is_default:
			frappe.db.sql(
				"UPDATE `tabQI Prompt Config` SET is_default=0 WHERE industry_id=%s AND name!=%s",
				(self.industry_id, self.name or "__new__"),
			)

	def validate(self):
		if not self.version_label:
			frappe.throw("Version Label is required")
		if not self.industry_id:
			frappe.throw("Industry is required")

		# Validate JSON fields
		for field in ["enabled_sections", "section_order", "focus_areas", "restrictions"]:
			val = self.get(field)
			if val and isinstance(val, str):
				try:
					json.loads(val)
				except json.JSONDecodeError:
					frappe.throw(f"'{field}' must be a valid JSON array")
