import type { Project } from "@/types/project";
import type {
  ProjectInsert,
  ProjectLifecycleDb,
  ProjectOwnershipRoleDb,
  ProjectRow,
  ProjectStatusDb,
  ProjectUpdate,
} from "@/types/database";

const UI_TO_DB_STATUS: Record<Project["status"], ProjectStatusDb> = {
  Draft: "draft",
  "Pending Review": "pending_review",
  Active: "active",
  Sold: "sold",
  Rejected: "rejected",
};

const DB_TO_UI_STATUS: Record<ProjectStatusDb, Project["status"]> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  sold: "Sold",
  rejected: "Rejected",
};

const UI_TO_DB_LIFECYCLE: Record<Project["lifecycle"], ProjectLifecycleDb> = {
  Upcoming: "upcoming",
  "Under Construction": "under_construction",
  Ready: "ready",
};

const DB_TO_UI_LIFECYCLE: Record<ProjectLifecycleDb, Project["lifecycle"]> = {
  upcoming: "Upcoming",
  under_construction: "Under Construction",
  ready: "Ready",
};

const UI_TO_DB_OWNERSHIP: Record<Project["ownershipRole"], ProjectOwnershipRoleDb> = {
  Owner: "owner",
  Builder: "builder",
  "Marketing Partner": "marketing_partner",
};

const DB_TO_UI_OWNERSHIP: Record<ProjectOwnershipRoleDb, Project["ownershipRole"]> = {
  owner: "Owner",
  builder: "Builder",
  marketing_partner: "Marketing Partner",
};

function num(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function toDbProjectStatus(status: Project["status"]): ProjectStatusDb {
  return UI_TO_DB_STATUS[status];
}

export function toUiProjectStatus(status: ProjectStatusDb): Project["status"] {
  return DB_TO_UI_STATUS[status];
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    city: row.city,
    state: row.state ?? undefined,
    country: row.country ?? undefined,
    locality: row.locality,
    ownershipRole: DB_TO_UI_OWNERSHIP[row.ownership_role],
    lifecycle: DB_TO_UI_LIFECYCLE[row.lifecycle],
    propertyTypes: row.property_types ?? [],
    configurations: row.configurations ?? [],
    priceFrom: num(row.price_from),
    priceTo: num(row.price_to),
    sizeFrom: num(row.size_from),
    sizeTo: num(row.size_to),
    amenities: row.amenities ?? [],
    images: row.images ?? [],
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    reraId: row.rera_id ?? undefined,
    reraApproved: row.rera_approved,
    possessionDate: row.possession_date ?? undefined,
    launchDate: row.launch_date ?? undefined,
    status: toUiProjectStatus(row.status),
    rejectionReason: row.rejection_reason ?? null,
    featured: row.featured,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectCreateToInsert(input: {
  ownerId: string;
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
  priceFrom?: number | null;
  priceTo?: number | null;
  sizeFrom?: number | null;
  sizeTo?: number | null;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  reraId?: string | null;
  reraApproved: boolean;
  possessionDate?: string | null;
  launchDate?: string | null;
  status: Project["status"];
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}): ProjectInsert {
  return {
    owner_id: input.ownerId,
    title: input.title,
    description: input.description,
    city: input.city,
    state: input.state ?? null,
    country: input.country ?? "India",
    locality: input.locality,
    ownership_role: UI_TO_DB_OWNERSHIP[input.ownershipRole],
    lifecycle: UI_TO_DB_LIFECYCLE[input.lifecycle],
    property_types: input.propertyTypes,
    configurations: input.configurations,
    price_from: input.priceFrom ?? null,
    price_to: input.priceTo ?? null,
    size_from: input.sizeFrom ?? null,
    size_to: input.sizeTo ?? null,
    amenities: input.amenities,
    images: input.images,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    rera_id: input.reraId ?? null,
    rera_approved: input.reraApproved,
    possession_date: input.possessionDate ?? null,
    launch_date: input.launchDate ?? null,
    status: toDbProjectStatus(input.status),
    featured: input.featured,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
  };
}

export function mapProjectUpdateToPatch(
  updates: Partial<Project> & { rejectionReason?: string | null },
): ProjectUpdate {
  const patch: ProjectUpdate = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.city !== undefined) patch.city = updates.city;
  if (updates.state !== undefined) patch.state = updates.state ?? null;
  if (updates.country !== undefined) patch.country = updates.country ?? null;
  if (updates.locality !== undefined) patch.locality = updates.locality;
  if (updates.ownershipRole !== undefined) {
    patch.ownership_role = UI_TO_DB_OWNERSHIP[updates.ownershipRole];
  }
  if (updates.lifecycle !== undefined) {
    patch.lifecycle = UI_TO_DB_LIFECYCLE[updates.lifecycle];
  }
  if (updates.propertyTypes !== undefined) patch.property_types = updates.propertyTypes;
  if (updates.configurations !== undefined) patch.configurations = updates.configurations;
  if (updates.priceFrom !== undefined) patch.price_from = updates.priceFrom ?? null;
  if (updates.priceTo !== undefined) patch.price_to = updates.priceTo ?? null;
  if (updates.sizeFrom !== undefined) patch.size_from = updates.sizeFrom ?? null;
  if (updates.sizeTo !== undefined) patch.size_to = updates.sizeTo ?? null;
  if (updates.amenities !== undefined) patch.amenities = updates.amenities;
  if (updates.images !== undefined) patch.images = updates.images;
  if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
  if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
  // Ignore RERA updates for projects until re-enabled in product.
  // if (updates.reraId !== undefined) patch.rera_id = updates.reraId ?? null;
  // if (updates.reraApproved !== undefined) patch.rera_approved = updates.reraApproved;
  if (updates.possessionDate !== undefined) {
    patch.possession_date = updates.possessionDate ?? null;
  }
  if (updates.launchDate !== undefined) patch.launch_date = updates.launchDate ?? null;
  if (updates.status !== undefined) patch.status = toDbProjectStatus(updates.status);
  if (updates.rejectionReason !== undefined) {
    patch.rejection_reason = updates.rejectionReason;
  }
  if (updates.featured !== undefined) patch.featured = updates.featured;
  if (updates.seoTitle !== undefined) patch.seo_title = updates.seoTitle ?? null;
  if (updates.seoDescription !== undefined) {
    patch.seo_description = updates.seoDescription ?? null;
  }
  return patch;
}
