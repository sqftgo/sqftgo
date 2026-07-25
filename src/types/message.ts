export type MessageThreadKind = "direct" | "support";
export type MessageThreadStatus = "open" | "resolved" | "archived";

export interface MessageParticipant {
  id: string;
  name: string;
  email: string;
  role: "user" | "broker" | "admin";
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: MessageParticipant[];
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  status: MessageThreadStatus;
  kind: MessageThreadKind;
  propertyId?: string;
  propertyTitle?: string;
  createdBy: string;
  createdAt: string;
}

export interface MessageThreadDetail extends MessageThread {
  messages: ChatMessage[];
}
