export { propertyService, supabasePropertyRepository } from "./properties";
export type { PropertyRepository, PropertyFilters, PropertyCreateInput } from "./properties";

export { authService, supabaseAuthRepository } from "./auth";
export type { AuthRepository, AuthSession, AuthRole } from "./auth";

export { inquiryService, supabaseInquiryRepository } from "./inquiries";
export type { InquiryRepository } from "./inquiries";

export { dealerService, supabaseDealerRepository } from "./dealers";
export type { DealerRepository, DealerFilters } from "./dealers";

export { catalogService, mockCatalogRepository } from "./catalog";
export type { CatalogRepository } from "./catalog";

export { notificationService, supabaseNotificationRepository } from "./notifications";
export type { NotificationRepository } from "./notifications";

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
