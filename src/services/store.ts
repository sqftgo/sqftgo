import type { MockUser, UserProfile } from "@/types";
import { initialMockUsers } from "@/data";

/**
 * Slim leftover client store: only admin user list cache until pages finish hydrating
 * from `/api/admin/users`. All marketplace domains hit Supabase via BFF.
 */
export interface AppStore {
  adminUsers: MockUser[];
}

function createInitialStore(): AppStore {
  return {
    adminUsers: structuredClone(initialMockUsers),
  };
}

let store = createInitialStore();

type Listener = () => void;
const listeners = new Set<Listener>();

export function getStore(): AppStore {
  return store;
}

export function replaceStore(next: AppStore) {
  store = next;
  listeners.forEach((l) => l());
}

export function patchStore(partial: Partial<AppStore>) {
  store = { ...store, ...partial };
  listeners.forEach((l) => l());
}

export function subscribeStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStore() {
  store = createInitialStore();
  listeners.forEach((l) => l());
}

export type SessionSnapshot = {
  isLoggedIn: boolean;
  userEmail: string;
  userRole: "user" | "broker" | "admin" | null;
  userName: string;
  userProfile: UserProfile | null;
  favorites: string[];
  compareList: string[];
  selectedCity: string;
};
