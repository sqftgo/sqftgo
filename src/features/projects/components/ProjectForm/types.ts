import type { Project } from "@/types";

export type ProjectFormValues = {
  title: string;
  description: string;
  city: string;
  state?: string;
  country?: string;
  locality: string;
  ownershipRole: Project["ownershipRole"];
  lifecycle: Project["lifecycle"];
  propertyTypes: string[];
  configurations: string[];
  priceFrom?: number;
  priceTo?: number;
  sizeFrom?: number;
  sizeTo?: number;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  possessionDate?: string;
  launchDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: "Draft" | "Pending Review";
};

export type ProjectFormProps = {
  mode: "create" | "edit";
  initial?: Partial<Project>;
  defaultContactName?: string;
  defaultContactPhone?: string;
  onSubmit: (data: ProjectFormValues) => Promise<void>;
};

export type SetProjectField = <K extends keyof ProjectFormValues>(
  key: K,
  value: ProjectFormValues[K],
) => void;

export function emptyProjectForm(
  initial?: Partial<Project>,
  defaults?: { name?: string; phone?: string },
): ProjectFormValues {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    city: initial?.city ?? "",
    state: initial?.state,
    country: initial?.country ?? "India",
    locality: initial?.locality ?? "",
    ownershipRole: initial?.ownershipRole ?? "Owner",
    lifecycle: initial?.lifecycle ?? "Upcoming",
    propertyTypes: initial?.propertyTypes ?? [],
    configurations: initial?.configurations ?? [],
    priceFrom: initial?.priceFrom,
    priceTo: initial?.priceTo,
    sizeFrom: initial?.sizeFrom,
    sizeTo: initial?.sizeTo,
    amenities: initial?.amenities ?? [],
    images: initial?.images ?? [],
    contactName: initial?.contactName ?? defaults?.name ?? "",
    contactPhone: initial?.contactPhone ?? defaults?.phone ?? "",
    possessionDate: initial?.possessionDate,
    launchDate: initial?.launchDate,
    seoTitle: initial?.seoTitle,
    seoDescription: initial?.seoDescription,
    status: "Pending Review",
  };
}

export function formatInr(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
