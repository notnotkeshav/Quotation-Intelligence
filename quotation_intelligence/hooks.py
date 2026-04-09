app_name = 'quotation_intelligence'
app_title = 'Quotation Intelligence'
app_publisher = 'Keshav Kumar'
app_description = 'AI-Powered proposal generation system for Frappe.'
app_email = 'keshav@extensionerp.com'
app_license = 'mit'

# Frappe Page registration
page_js = {'quotation_builder': 'public/js/quotation_builder.js'}

# DocTypes
fixtures = []

# Scheduler (optional — expire proposals)
scheduler_events = {
    'daily': [
        'quotation_intelligence.tasks.expire_proposals',
    ]
}

website_route_rules = [{'from_route': '/proposal/<path:app_path>', 'to_route': 'proposal'},{'from_route': '/qi/proposal/<name>','to_route':   'qi/proposal',},]
