import { apiClient } from "@/lib/api/client";
import type { ChatMessage, MessageThread, MessageThreadDetail } from "@/types";

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

export const messageApi: MessageRepository = {
  async listThreads(opts) {
    const params = new URLSearchParams();
    if (opts?.kind) params.set("kind", opts.kind);
    if (opts?.status) params.set("status", opts.status);
    const qs = params.toString() ? `?${params}` : "";
    return apiClient<MessageThread[]>(`/api/messages/threads${qs}`);
  },

  async getThread(id) {
    return apiClient<MessageThreadDetail>(`/api/messages/threads/${id}`);
  },

  async createThread(payload) {
    return apiClient<MessageThread>("/api/messages/threads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async reply(threadId, body) {
    return apiClient<ChatMessage>(`/api/messages/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async updateThread(id, updates) {
    return apiClient<MessageThread>(`/api/messages/threads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

export const messageService: MessageRepository = messageApi;

/** @deprecated Use messageApi */
export const supabaseMessageRepository = messageApi;
