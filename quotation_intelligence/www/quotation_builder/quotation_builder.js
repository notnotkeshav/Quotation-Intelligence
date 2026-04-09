// quotation_intelligence/page/quotation_builder/quotation_builder.js
// Frappe calls this automatically when the page loads.

frappe.pages['quotation-builder'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Quotation Intelligence',
		single_column: true,
	});

	// Mount the React SPA into the page body
	$(wrapper).find('.page-content').html('<div id="qi-root" style="min-height:90vh;"></div>');

	// Wait for bundle to be available (loaded via hooks.py app_include_js)
	frappe.require('/assets/quotation_intelligence/qi_bundle.js', function() {
		if (window.QuotationIntelligence && window.QuotationIntelligence.mount) {
			window.QuotationIntelligence.mount('#qi-root');
		} else {
			console.error('[QI] Bundle loaded but mount function not found.');
		}
	});
};

frappe.pages['quotation-builder'].on_page_show = function(wrapper) {
	// Re-render on navigation if already mounted
};
