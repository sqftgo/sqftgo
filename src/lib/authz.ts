export type AuthzProfile = {
  role: "user" | "broker" | "admin" | null;
  status?: string | null;
};

function isActiveStatus(status: string | null | undefined): boolean {
  return status === "active";
}

export function isAdminProfile(p: AuthzProfile | null | undefined): boolean {
  return p?.role === "admin";
}

export function isBrokerOrAdmin(p: AuthzProfile | null | undefined): boolean {
  const role = p?.role;
  return role === "broker" || role === "admin";
}

export function canAccessAdminRoutes(p: AuthzProfile | null | undefined): boolean {
  return isAdminProfile(p) && isActiveStatus(p?.status);
}

export function canAccessDealerDashboard(
  p: AuthzProfile | null | undefined
): boolean {
  return isBrokerOrAdmin(p) && isActiveStatus(p?.status);
}

export function canCreatePropertyListing(
  p: AuthzProfile | null | undefined,
  listingStatus?: string | null
): boolean {
  if (!p?.role || !isActiveStatus(p.status)) return false;
  if (p.role === "admin" || p.role === "broker") return true;
  if (p.role !== "user") return false;
  return listingStatus !== "rejected";
}

export function assertAdmin(p: AuthzProfile | null | undefined): void {
  if (!isAdminProfile(p)) {
    throw new Error("Forbidden");
  }
}
