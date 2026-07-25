export type PlatformSettings = {
  siteName: string;
  tagline: string;
  supportEmail: string | null;
  supportPhone: string | null;
  maintenanceMode: boolean;
  requireListingApproval: boolean;
  maxListingsPerDealer: number | null;
  currencyCode: string;
  analyticsMeasurementId: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

export type PlatformAnalytics = {
  accounts: number;
  activeListings: number;
  pendingReview: number;
  propertyInquiries: number;
  generalEnquiries: number;
  dealers: number;
  siteVisits: number;
  inventoryValueSum: number;
  cityBreakdown: { city: string; count: number }[];
  monthlyInquiries: { month: string; count: number }[];
  recentInquiries: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    date: string;
    propertyTitle: string;
  }[];
};
