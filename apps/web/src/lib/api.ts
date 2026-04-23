const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/chat";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, receiverId, content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  const res = await fetch(`${API_URL}/messages/${userId1}/${userId2}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function markAsRead(messageId: string): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

export async function getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
  const res = await fetch(`${API_URL}/messages/unread/${userId}`);
  if (!res.ok) throw new Error("Failed to get unread count");
  return res.json();
}
