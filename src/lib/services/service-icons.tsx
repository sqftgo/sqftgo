import {
  Briefcase,
  Building2,
  Compass,
  CreditCard,
  Droplets,
  FileCheck2,
  Hammer,
  Paintbrush,
  Scale,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/interior|decor|paint/i, Paintbrush],
  [/architect/i, Building2],
  [/contract|builder|construction|civil/i, Hammer],
  [/vaa?stu/i, Compass],
  [/legal|lawyer|document|rera/i, Scale],
  [/loan|finance|bank/i, CreditCard],
  [/shift|mover|pack|transport/i, Truck],
  [/plumb|electric|repair|maintenance/i, Droplets],
  [/clean/i, Sparkles],
  [/inspect|valuat/i, FileCheck2],
];

export function serviceIconFor(nameOrIcon?: string | null): LucideIcon {
  if (!nameOrIcon) return Briefcase;
  return KEYWORD_ICONS.find(([pattern]) => pattern.test(nameOrIcon))?.[1] ?? Briefcase;
}
