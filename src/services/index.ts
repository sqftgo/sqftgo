export { propertyService, mockPropertyRepository } from "./properties";
export type { PropertyRepository, PropertyFilters, PropertyCreateInput } from "./properties";

export { authService, supabaseAuthRepository } from "./auth";
export type { AuthRepository, AuthSession, AuthRole } from "./auth";

export { inquiryService, mockInquiryRepository } from "./inquiries";
export type { InquiryRepository } from "./inquiries";

export { dealerService, mockDealerRepository } from "./dealers";
export type { DealerRepository } from "./dealers";

export { catalogService, mockCatalogRepository } from "./catalog";
export type { CatalogRepository } from "./catalog";

export {
  getStore,
  patchStore,
  subscribeStore,
  resetStore,
  type AppStore,
  type MessageThread,
  type VisitBooking,
  type SessionSnapshot,
} from "./store";
