export type ListingPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePaise: number;
  priceInr: number;
  slots: number;
  isActive: boolean;
  sortOrder: number;
};

export type DealerListingQuotaView = {
  used: number;
  free: number;
  purchased: number;
  quota: number;
  remaining: number;
  atCap: boolean;
  checkoutPath: string;
};
