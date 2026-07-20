import { simulateNetwork } from "@/mocks/delay";
import type { DirectoryProfile } from "@/types";
import { getStore, patchStore, type MessageThread, type VisitBooking } from "./store";

export interface DealerRepository {
  listProfiles(filters?: { city?: string; category?: string }): Promise<DirectoryProfile[]>;
  getById(id: string): Promise<DirectoryProfile | null>;
  getByEmail(email: string): Promise<DirectoryProfile | null>;
  create(profile: Omit<DirectoryProfile, "id">): Promise<DirectoryProfile>;
  update(id: string, updates: Partial<DirectoryProfile>): Promise<DirectoryProfile>;
  listMessages(forRole?: MessageThread["forRole"]): Promise<MessageThread[]>;
  listVisits(): Promise<VisitBooking[]>;
}

export const mockDealerRepository: DealerRepository = {
  async listProfiles(filters) {
    await simulateNetwork(100);
    return getStore().directoryProfiles.filter((p) => {
      if (filters?.city && filters.city !== "All India" && p.city !== filters.city) return false;
      if (filters?.category && p.category !== filters.category) return false;
      return true;
    });
  },

  async getById(id) {
    await simulateNetwork(80);
    return getStore().directoryProfiles.find((p) => p.id === id) ?? null;
  },

  async getByEmail(email) {
    await simulateNetwork(60);
    return (
      getStore().directoryProfiles.find(
        (p) => p.email.toLowerCase() === email.toLowerCase()
      ) ?? null
    );
  },

  async create(profile) {
    await simulateNetwork(160);
    const item: DirectoryProfile = { ...profile, id: `dir-${Date.now()}` };
    patchStore({ directoryProfiles: [item, ...getStore().directoryProfiles] });
    return item;
  },

  async update(id, updates) {
    await simulateNetwork(140);
    const next = getStore().directoryProfiles.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    const updated = next.find((p) => p.id === id);
    if (!updated) throw new Error("Profile not found");
    patchStore({ directoryProfiles: next });
    return updated;
  },

  async listMessages(forRole) {
    await simulateNetwork(90);
    const all = getStore().messages;
    return forRole ? all.filter((m) => m.forRole === forRole) : [...all];
  },

  async listVisits() {
    await simulateNetwork(80);
    return [...getStore().visits];
  },
};

export const dealerService: DealerRepository = mockDealerRepository;
