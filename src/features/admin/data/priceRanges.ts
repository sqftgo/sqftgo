import {
  BUDGET_BUY_MAX_OPTIONS,
  BUDGET_BUY_MIN_OPTIONS,
  BUDGET_RENT_MAX_OPTIONS,
  BUDGET_RENT_MIN_OPTIONS,
} from "@/constants/propertyOptions";

export type PriceOption = {
  label: string;
  value: string;
};

export type PriceRangeGroupKey = "buyMin" | "buyMax" | "rentMin" | "rentMax";

export type PriceRangeConfig = Record<PriceRangeGroupKey, PriceOption[]>;

export const PRICE_RANGES_STORAGE_KEY = "sqftgo_admin_price_ranges_v1";

export const DEFAULT_PRICE_RANGES: PriceRangeConfig = {
  buyMin: BUDGET_BUY_MIN_OPTIONS,
  buyMax: BUDGET_BUY_MAX_OPTIONS,
  rentMin: BUDGET_RENT_MIN_OPTIONS,
  rentMax: BUDGET_RENT_MAX_OPTIONS,
};

export const PRICE_RANGE_GROUPS: {
  key: PriceRangeGroupKey;
  title: string;
  description: string;
  placeholderLabel: string;
}[] = [
  {
    key: "buyMin",
    title: "Buy / Sell — Min",
    description: "Minimum budget options for purchase filters",
    placeholderLabel: "Min Price",
  },
  {
    key: "buyMax",
    title: "Buy / Sell — Max",
    description: "Maximum budget options for purchase filters",
    placeholderLabel: "Max Price",
  },
  {
    key: "rentMin",
    title: "Rent / Lease — Min",
    description: "Minimum rent options for rental filters",
    placeholderLabel: "Min Rent",
  },
  {
    key: "rentMax",
    title: "Rent / Lease — Max",
    description: "Maximum rent options for rental filters",
    placeholderLabel: "Max Rent",
  },
];

function isValidOption(item: unknown): item is PriceOption {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as PriceOption).label === "string" &&
    typeof (item as PriceOption).value === "string"
  );
}

function isValidConfig(parsed: unknown): parsed is PriceRangeConfig {
  if (!parsed || typeof parsed !== "object") return false;
  const keys: PriceRangeGroupKey[] = ["buyMin", "buyMax", "rentMin", "rentMax"];
  return keys.every((key) => {
    const list = (parsed as PriceRangeConfig)[key];
    return Array.isArray(list) && list.every(isValidOption);
  });
}

export function loadPriceRanges(): PriceRangeConfig {
  if (typeof window === "undefined") return DEFAULT_PRICE_RANGES;
  try {
    const raw = window.localStorage.getItem(PRICE_RANGES_STORAGE_KEY);
    if (!raw) return DEFAULT_PRICE_RANGES;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidConfig(parsed)) return DEFAULT_PRICE_RANGES;
    return parsed;
  } catch {
    return DEFAULT_PRICE_RANGES;
  }
}

export function savePriceRanges(config: PriceRangeConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRICE_RANGES_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("sqftgo:price-ranges-updated"));
}

/** Keep the empty placeholder first, then sort numeric values ascending. */
export function normalizePriceOptions(
  options: PriceOption[],
  placeholderLabel: string
): PriceOption[] {
  const placeholder = options.find((o) => o.value === "") ?? {
    label: placeholderLabel,
    value: "",
  };
  const rest = options
    .filter((o) => o.value !== "")
    .map((o) => ({
      label: o.label.trim() || formatPriceLabel(Number(o.value) || 0),
      value: String(Math.max(0, Number(o.value) || 0)),
    }))
    .filter((o, index, arr) => arr.findIndex((x) => x.value === o.value) === index)
    .sort((a, b) => Number(a.value) - Number(b.value));

  return [{ ...placeholder, label: placeholderLabel }, ...rest];
}

export function formatPriceLabel(amount: number): string {
  if (!amount) return "₹0";
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, "")} Crore${cr >= 2 ? "s" : ""}`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2).replace(/\.?0+$/, "")} Lakh${lakh >= 2 ? "s" : ""}`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
