export { propertyService, propertyApi, supabasePropertyRepository } from "./properties";
export type { PropertyRepository, PropertyFilters, PropertyCreateInput } from "./properties";

export { authService, authApi, supabaseAuthRepository } from "./auth";
export type { AuthRepository, AuthSession, AuthRole } from "./auth";

export { inquiryService, inquiryApi, supabaseInquiryRepository } from "./inquiries";
export type { InquiryRepository } from "./inquiries";

export { dealerService, dealerApi, supabaseDealerRepository } from "./dealers";
export type { DealerRepository, DealerFilters } from "./dealers";

export { catalogService, catalogApi, supabaseCatalogRepository } from "./catalog";
export type { CatalogRepository } from "./catalog";

export { notificationService, notificationApi, supabaseNotificationRepository } from "./notifications";
export type { NotificationRepository } from "./notifications";

export { visitService, visitApi, supabaseVisitRepository } from "./visits";
export type { VisitRepository, VisitCreatePayload, VisitUpdatePayload } from "./visits";

export { messageService, messageApi, supabaseMessageRepository } from "./messages";
export type { MessageRepository, MessageThreadCreatePayload } from "./messages";

export { favoritesService, favoritesApi, supabaseFavoritesRepository } from "./favorites";
export type { FavoritesRepository } from "./favorites";

export { platformService } from "./platform";
export { kycService } from "./kyc";

export { assistanceService, assistanceApi, supabaseAssistanceRepository } from "./assistance";
export type { AssistanceRepository } from "./assistance";

export { enquiryService, enquiryApi, supabaseEnquiryRepository } from "./enquiries";
export type { EnquiryRepository } from "./enquiries";
