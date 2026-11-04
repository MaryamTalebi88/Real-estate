import {
  Bath,
  BedDouble,
  Box,
  Building2,
  Car,
  Crown,
  Dumbbell,
  Home,
  LandPlot,
  MapPin,
  MoveVertical,
  ShieldCheck,
  Trees,
  Waves,
  Wind,
  Cpu,
  Briefcase,
  Check,
} from 'lucide-react'

const MAP = {
  home: Home,
  building: Building2,
  crown: Crown,
  briefcase: Briefcase,
  land: LandPlot,
  waves: Waves,
  trees: Trees,
  car: Car,
  shield: ShieldCheck,
  lift: MoveVertical,
  balcony: Building2,
  wind: Wind,
  cpu: Cpu,
  dumbbell: Dumbbell,
  box: Box,
  check: Check,
}

export function AmenityIcon({ name = 'check', size = 18, ...rest }) {
  const Icon = MAP[name] || Check
  return <Icon size={size} {...rest} />
}

export function CategoryIcon({ name = 'home', size = 22, ...rest }) {
  const Icon = MAP[name] || Building2
  return <Icon size={size} {...rest} />
}

export { Bath, BedDouble, MapPin, Car, Building2 }
