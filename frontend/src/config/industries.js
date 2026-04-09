// Icon names reference lucide-react — mapped in IndustryGrid and SectionBlock components

export const INDUSTRY_ICON_MAP = {
  'Manufacturing':           'Factory',
  'Retail':                  'ShoppingBag',
  'Healthcare':              'HeartPulse',
  'Construction':            'HardHat',
  'Education':               'GraduationCap',
  'Logistics':               'Truck',
  'Financial Services':      'Landmark',
  'Hospitality':             'UtensilsCrossed',
  'IT Services':             'Monitor',
  'Trading':                 'BarChart2',
  'Agriculture':             'Leaf',
  'Nonprofit':               'HandHeart',
  'Accounting':              'Calculator',
  'Advertising':             'Megaphone',
  'Aerospace':               'Plane',
  'Automotive':              'Car',
  'Banking':                 'Building2',
  'Biotechnology':           'FlaskConical',
  'Chemical':                'TestTube',
  'Consulting':              'Briefcase',
  'Energy':                  'Zap',
  'Entertainment & Leisure': 'Theater',
  'Food, Beverage & Tobacco':'Coffee',
  'Pharmaceuticals':         'Pill',
  'Real Estate':             'Home',
  'Retail & Wholesale':      'Store',
  'Technology':              'Cpu',
  'Telecommunications':      'Radio',
  'Transportation':          'Bus',
}

export const SECTION_BLOCKS = [
  { id: 'hero',        label: 'Hero / Executive Summary', icon: 'Presentation',  category: 'core',       required: true,  description: 'Opening value statement' },
  { id: 'objectives',  label: 'Business Objectives',      icon: 'Target',        category: 'core',                        description: 'Goals and expected outcomes' },
  { id: 'scope',       label: 'Scope of Work',            icon: 'ClipboardList', category: 'core',       required: true,  description: 'Deliverables and inclusions' },
  { id: 'approach',    label: 'Approach & Methodology',   icon: 'Workflow',      category: 'technical',                   description: 'How we will execute' },
  { id: 'timeline',    label: 'Project Timeline',         icon: 'CalendarDays',  category: 'planning',                    description: 'Phases and milestones' },
  { id: 'team',        label: 'Team Structure',           icon: 'Users',         category: 'resources',                   description: 'Key personnel and roles' },
  { id: 'commercials', label: 'Pricing & Investment',     icon: 'DollarSign',    category: 'commercial', required: true,  description: 'Cost breakdown and terms' },
  { id: 'benefits',    label: 'Benefits & ROI',           icon: 'TrendingUp',    category: 'value',                       description: 'Quantified returns' },
  { id: 'case_studies',label: 'Case Studies',             icon: 'BookOpen',      category: 'proof',                       description: 'Success stories' },
  { id: 'technology',  label: 'Technology Stack',         icon: 'Layers',        category: 'technical',                   description: 'Tools and platforms' },
  { id: 'support',     label: 'Support & Maintenance',    icon: 'LifeBuoy',      category: 'services',                    description: 'Post-implementation support' },
  { id: 'terms',       label: 'Terms & Conditions',       icon: 'FileText',      category: 'legal',                       description: 'Legal and contractual terms' },
  { id: 'next_steps',  label: 'Next Steps / CTA',         icon: 'ArrowRight',    category: 'closing',    required: true,  description: 'Call to action' },
]

export const TONE_OPTIONS = [
  { id: 'consultative', label: 'Consultative', desc: 'Advisory, partnership-focused' },
  { id: 'formal',       label: 'Formal',       desc: 'Corporate and professional'    },
  { id: 'confident',    label: 'Confident',    desc: 'Bold and assertive'            },
  { id: 'friendly',     label: 'Friendly',     desc: 'Warm and approachable'         },
  { id: 'technical',    label: 'Technical',    desc: 'Detailed and precise'          },
]

export const PALETTE_PRESETS = [
  { id: 'ocean',   label: 'Ocean',   primary: '#1591AB', accent: '#22b5d4' },
  { id: 'forest',  label: 'Forest',  primary: '#10b981', accent: '#34d399' },
  { id: 'sunset',  label: 'Sunset',  primary: '#f59e0b', accent: '#fbbf24' },
  { id: 'royal',   label: 'Royal',   primary: '#7c3aed', accent: '#a78bfa' },
  { id: 'crimson', label: 'Crimson', primary: '#dc2626', accent: '#f87171' },
  { id: 'custom',  label: 'Custom',  primary: '#1591AB', accent: '#22b5d4' },
]

export const FOCUS_AREAS = [
  'ROI & Cost Savings', 'Automation', 'Compliance & Security', 'Scalability',
  'User Experience', 'Integration', 'Training & Support', 'Time to Value',
  'Data Analytics', 'Process Efficiency',
]

export function getDefaultPromptConfig(industry_id) {
  return {
    industry_id,
    version_label: 'Default v1',
    is_default: true,
    tone: 'consultative',
    primary_color: '#1591AB',
    accent_color: '#22b5d4',
    enabled_sections: JSON.stringify(['hero','objectives','scope','approach','timeline','commercials','benefits','next_steps']),
    section_order:    JSON.stringify(['hero','objectives','scope','approach','timeline','commercials','benefits','next_steps']),
    focus_areas:      JSON.stringify(['ROI & Cost Savings','Automation','Time to Value']),
    custom_instructions: `You are generating a professional proposal for a ${industry_id} company implementing Frappe ERPNext.\nFocus on clear value, measurable outcomes, and industry-specific pain points.\nKeep language professional, consultative, and specific to the client's context.`,
    restrictions: JSON.stringify(['Avoid jargon without explanation','Do not mention competitors','Keep pricing factual']),
  }
}
