import { findDemoAccount } from "@/constants/demoAccounts";
import { simulateNetwork } from "@/mocks/delay";
import type { MockUser, UserProfile } from "@/types";
import { getStore, patchStore } from "./store";

export type AuthRole = "user" | "broker" | "admin";

export interface AuthSession {
  email: string;
  role: AuthRole;
  name: string;
  profile: UserProfile;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  signup(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthSession>;
  listUsers(): Promise<MockUser[]>;
  updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser>;
}

function toProfile(email: string, name: string, role: AuthRole): UserProfile {
  return {
    id: `profile-${email}`,
    name,
    email,
    role,
    joinedDate: new Date().toISOString().split("T")[0],
  };
}

function inferBrokerRole(email: string): AuthRole {
  const lower = email.toLowerCase();
  if (lower.includes("broker") || lower.includes("dealer")) return "broker";
  return "user";
}

export const mockAuthRepository: AuthRepository = {
  async login(email, password) {
    await simulateNetwork(200);
    const demo = findDemoAccount(email, password);
    if (demo) {
      return {
        email: demo.email,
        role: demo.role,
        name: demo.name,
        profile: toProfile(demo.email, demo.name, demo.role),
      };
    }

    const user = getStore().mockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || user.status === "suspended") {
      throw new Error("Invalid email or password");
    }
    // Non-demo mock users accept any non-empty password in this frontend-only mock
    if (!password) throw new Error("Password is required");

    return {
      email: user.email,
      role: user.role,
      name: user.name,
      profile: toProfile(user.email, user.name, user.role),
    };
  },

  async signup({ name, email, password }) {
    await simulateNetwork(220);
    if (!name.trim() || !email.trim() || !password) {
      throw new Error("All fields are required");
    }
    if (email.toLowerCase() === "admin@sqftgo.com") {
      throw new Error("This email is reserved");
    }

    const exists = getStore().mockUsers.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) throw new Error("An account with this email already exists");

    const role = inferBrokerRole(email);
    const newUser: MockUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      inquiriesCount: 0,
    };
    patchStore({ mockUsers: [newUser, ...getStore().mockUsers] });

    return {
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      profile: toProfile(newUser.email, newUser.name, newUser.role),
    };
  },

  async listUsers() {
    await simulateNetwork(100);
    return [...getStore().mockUsers];
  },

  async updateUser(id, updates) {
    await simulateNetwork(120);
    const next = getStore().mockUsers.map((u) => (u.id === id ? { ...u, ...updates } : u));
    const updated = next.find((u) => u.id === id);
    if (!updated) throw new Error("User not found");
    patchStore({ mockUsers: next });
    return updated;
  },
};

export const authService: AuthRepository = mockAuthRepository;
