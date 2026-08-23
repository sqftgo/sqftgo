export type PlatformSettings = {
  siteName: string;
  tagline: string;
  supportEmail: string | null;
  supportPhone: string | null;
  maintenanceMode: boolean;
  requireListingApproval: boolean;
  allowUserListings: boolean;
  maxListingsPerDealer: number | null;
  maxListingsPerUser: number;
  currencyCode: string;
  analyticsMeasurementId: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

export type PlatformAnalytics = {
  accounts: number;
  buyerUsers: number;
  brokerUsers: number;
  propertiesTotal: number;
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

export type DealerAnalytics = {
  listingsTotal: number;
  listingsActive: number;
  listingsPending: number;
  listingsDraft: number;
  listingsRejected: number;
  inquiriesTotal: number;
  visitsTotal: number;
  visitsPending: number;
  visitsConfirmed: number;
  inventoryValueSum: number;
  cityBreakdown: { city: string; count: number }[];
  monthlyInquiries: { month: string; count: number }[];
  topListings: {
    id: string;
    title: string;
    city: string;
    status: string;
    inquiryCount: number;
  }[];
  listings: {
    id: string;
    title: string;
    type: string;
    city: string;
    status: string;
    inquiryCount: number;
    price: number;
  }[];
};
