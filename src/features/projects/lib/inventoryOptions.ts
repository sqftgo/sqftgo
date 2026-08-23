import { PROPERTY_TYPES } from "@/constants/propertyOptions";

export type ProjectInventoryKind = "residential" | "commercial" | "plot";

const RESIDENTIAL = new Set(["Home", "Villa", "Hotel", "Apartment"]);
const COMMERCIAL = new Set(["Office Space", "Commercial Space", "Shop"]);
const PLOT = new Set(["Agricultural Land", "Industrial Plot"]);

const CONFIGS_BY_KIND: Record<ProjectInventoryKind, string[]> = {
  residential: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Studio", "Penthouse"],
  commercial: ["Shop", "Showroom", "Office", "Warehouse bay", "Food court unit"],
  plot: ["Plot", "Corner plot", "Farm plot", "Colony plot"],
};

export function inventoryKindsForTypes(propertyTypes: string[]): ProjectInventoryKind[] {
  const kinds = new Set<ProjectInventoryKind>();
  for (const t of propertyTypes) {
    if (RESIDENTIAL.has(t)) kinds.add("residential");
    else if (COMMERCIAL.has(t)) kinds.add("commercial");
    else if (PLOT.has(t)) kinds.add("plot");
  }
  return Array.from(kinds);
}

/** Config chips shown only for the inventory kinds the dealer selected. */
export function configurationOptionsForTypes(propertyTypes: string[]): string[] {
  const kinds = inventoryKindsForTypes(propertyTypes);
  if (kinds.length === 0) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const kind of kinds) {
    for (const c of CONFIGS_BY_KIND[kind]) {
      if (!seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
  }
  return out;
}

export function sizeFieldCopy(propertyTypes: string[]): {
  fromLabel: string;
  toLabel: string;
  hint: string;
} {
  const kinds = inventoryKindsForTypes(propertyTypes);
  if (kinds.length === 0) {
    return {
      fromLabel: "Size from (sq.ft)",
      toLabel: "Size to (sq.ft)",
      hint: "Select property types above — size applies to those inventory units.",
    };
  }
  if (kinds.length === 1) {
    const kind = kinds[0];
    if (kind === "residential") {
      return {
        fromLabel: "Flat / home size from (sq.ft)",
        toLabel: "Flat / home size to (sq.ft)",
        hint: "Carpet or built-up area for apartments, homes, villas, or hotel rooms.",
      };
    }
    if (kind === "commercial") {
      return {
        fromLabel: "Shop / office size from (sq.ft)",
        toLabel: "Shop / office size to (sq.ft)",
        hint: "Carpet area for shop, office, or commercial units in this project.",
      };
    }
    return {
      fromLabel: "Plot / colony size from (sq.ft)",
      toLabel: "Plot / colony size to (sq.ft)",
      hint: "Land area for plots or colony parcels in this project.",
    };
  }
  return {
    fromLabel: "Unit size from (sq.ft)",
    toLabel: "Unit size to (sq.ft)",
    hint: `Mixed inventory (${kinds.join(", ")}): overall size range across the types you selected.`,
  };
}

export function pruneConfigurations(
  propertyTypes: string[],
  configurations: string[],
): string[] {
  const allowed = new Set(configurationOptionsForTypes(propertyTypes));
  return configurations.filter((c) => allowed.has(c));
}

export const PROJECT_PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES.map((t) => ({
  label: t,
  value: t,
}));
