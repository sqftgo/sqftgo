export type ProjectStatusUi =
  | "Draft"
  | "Pending Review"
  | "Active"
  | "Sold"
  | "Rejected";

export type ProjectLifecycleUi = "Upcoming" | "Under Construction" | "Ready";

export type ProjectOwnershipRoleUi = "Owner" | "Builder" | "Marketing Partner";

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  state?: string;
  country?: string;
  locality: string;
  ownershipRole: ProjectOwnershipRoleUi;
  lifecycle: ProjectLifecycleUi;
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
  reraId?: string;
  reraApproved: boolean;
  possessionDate?: string;
  launchDate?: string;
  status: ProjectStatusUi;
  rejectionReason?: string | null;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};
