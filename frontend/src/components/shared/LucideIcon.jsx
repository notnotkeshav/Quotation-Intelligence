// Curated icon map — only imports what we use, enabling tree-shaking
import {
  Factory, ShoppingBag, HeartPulse, HardHat, GraduationCap, Truck,
  Landmark, UtensilsCrossed, Monitor, BarChart2, Leaf, HandHeart,
  Calculator, Megaphone, Plane, Car, Building2, FlaskConical, TestTube,
  Briefcase, Zap, Theater, Coffee, Pill, Home, Store, Cpu, Radio, Bus,
  // Section block icons
  Presentation, Target, ClipboardList, Workflow, CalendarDays, Users,
  DollarSign, TrendingUp, BookOpen, Layers, LifeBuoy, FileText, ArrowRight,
  // UI icons
  Circle, Settings, Bot, ChevronRight, ChevronLeft,
} from 'lucide-react'

const MAP = {
  Factory, ShoppingBag, HeartPulse, HardHat, GraduationCap, Truck,
  Landmark, UtensilsCrossed, Monitor, BarChart2, Leaf, HandHeart,
  Calculator, Megaphone, Plane, Car, Building2, FlaskConical, TestTube,
  Briefcase, Zap, Theater, Coffee, Pill, Home, Store, Cpu, Radio, Bus,
  Presentation, Target, ClipboardList, Workflow, CalendarDays, Users,
  DollarSign, TrendingUp, BookOpen, Layers, LifeBuoy, FileText, ArrowRight,
  Circle, Settings, Bot, ChevronRight, ChevronLeft,
}

export default function LucideIcon({ name, size = 18, className = '' }) {
  const Icon = MAP[name] || Circle
  return <Icon size={size} className={className} />
}
