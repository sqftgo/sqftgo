import type { ChatMessage, MessageThread, MessageThreadDetail } from "@/types";

async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : "Request failed"
    );
  }
  return data;
}

export type MessageThreadCreatePayload = {
  subject: string;
  participantEmail: string;
  body: string;
  kind?: "direct" | "support";
  propertyId?: string;
};

export interface MessageRepository {
  listThreads(opts?: { kind?: string; status?: string }): Promise<MessageThread[]>;
  getThread(id: string): Promise<MessageThreadDetail>;
  createThread(payload: MessageThreadCreatePayload): Promise<MessageThread>;
  reply(threadId: string, body: string): Promise<ChatMessage>;
  updateThread(
    id: string,
    updates: { status?: "open" | "resolved" | "archived"; markRead?: boolean }
  ): Promise<MessageThread>;
}

export const supabaseMessageRepository: MessageRepository = {
  async listThreads(opts) {
    const params = new URLSearchParams();
    if (opts?.kind) params.set("kind", opts.kind);
    if (opts?.status) params.set("status", opts.status);
    const qs = params.toString() ? `?${params}` : "";
    return apiJson<MessageThread[]>(`/api/messages/threads${qs}`);
  },

  async getThread(id) {
    return apiJson<MessageThreadDetail>(`/api/messages/threads/${id}`);
  },

  async createThread(payload) {
    return apiJson<MessageThread>("/api/messages/threads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async reply(threadId, body) {
    return apiJson<ChatMessage>(`/api/messages/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async updateThread(id, updates) {
    return apiJson<MessageThread>(`/api/messages/threads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

export const messageService: MessageRepository = supabaseMessageRepository;
