import type {
  ChatMessage,
  MessageParticipant,
  MessageThread,
  MessageThreadDetail,
} from "@/types/message";
import type {
  AppRole,
  MessageRow,
  MessageThreadRow,
  ProfileRow,
} from "@/types/database";

export type ThreadWithExtras = MessageThreadRow & {
  property_title?: string | null;
};

export function mapParticipants(
  ids: string[],
  profilesById: Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>
): MessageParticipant[] {
  return ids
    .map((id) => {
      const p = profilesById.get(id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role as AppRole,
      };
    })
    .filter((p): p is MessageParticipant => Boolean(p));
}

export function mapThreadRow(
  row: ThreadWithExtras,
  profilesById: Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>,
  unread: boolean
): MessageThread {
  return {
    id: row.id,
    subject: row.subject,
    participants: mapParticipants(row.participant_ids, profilesById),
    lastMessage: row.last_message_preview,
    lastMessageAt: row.last_message_at,
    unread,
    status: row.status,
    kind: row.kind,
    propertyId: row.property_id ?? undefined,
    propertyTitle: row.property_title ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function mapMessageRow(
  row: MessageRow,
  profilesById: Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>
): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderName: profilesById.get(row.sender_id)?.name ?? "User",
    body: row.body,
    createdAt: row.created_at,
  };
}

export function mapThreadDetail(
  row: ThreadWithExtras,
  messages: MessageRow[],
  profilesById: Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>,
  unread: boolean
): MessageThreadDetail {
  return {
    ...mapThreadRow(row, profilesById, unread),
    messages: messages.map((m) => mapMessageRow(m, profilesById)),
  };
}
