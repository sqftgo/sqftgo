import { simulateNetwork } from "@/mocks/delay";
import type { ActivityLog, Category, Location, Notification } from "@/types";
import { getStore, patchStore } from "./store";

export interface CatalogRepository {
  listNotifications(forRole?: Notification["forRole"]): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  listCategories(): Promise<Category[]>;
  updateCategories(categories: Category[]): Promise<Category[]>;
  listLocations(): Promise<Location[]>;
  updateLocations(locations: Location[]): Promise<Location[]>;
  listLogs(): Promise<ActivityLog[]>;
  addLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog>;
}

export const mockCatalogRepository: CatalogRepository = {
  async listNotifications(forRole) {
    await simulateNetwork(80);
    const all = getStore().notifications;
    if (!forRole || forRole === "all") return [...all];
    return all.filter((n) => n.forRole === forRole || n.forRole === "all");
  },

  async markNotificationRead(id) {
    await simulateNetwork(60);
    patchStore({
      notifications: getStore().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
  },

  async listCategories() {
    await simulateNetwork(60);
    return [...getStore().categories];
  },

  async updateCategories(categories) {
    await simulateNetwork(100);
    patchStore({ categories });
    return categories;
  },

  async listLocations() {
    await simulateNetwork(60);
    return [...getStore().locations];
  },

  async updateLocations(locations) {
    await simulateNetwork(100);
    patchStore({ locations });
    return locations;
  },

  async listLogs() {
    await simulateNetwork(80);
    return [...getStore().activityLogs];
  },

  async addLog(log) {
    await simulateNetwork(80);
    const item: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN"),
    };
    patchStore({ activityLogs: [item, ...getStore().activityLogs] });
    return item;
  },
};

export const catalogService: CatalogRepository = mockCatalogRepository;
