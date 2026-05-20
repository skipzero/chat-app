const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const DATABASE_NAME = process.env.NEXT_PUBLIC_DATABASE_NAME;
const API_BASE = `${SERVER_URL}/api`;

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
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

export interface Room {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

export async function getRooms(): Promise<Room[]> {
  return fetchJson<Room[]>(`${API_BASE}/rooms`);
}

export async function getRoomMessages(roomId: string): Promise<Message[]> {
  return fetchJson<Message[]>(`${API_BASE}/rooms/${roomId}/messages`);
}

export async function createRoom(name: string, description?: string): Promise<Room> {
  return fetchJson<Room>(`${API_BASE}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function sendMessage(senderId: string, senderName: string, receiverId: string, content: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, senderName, receiverId, content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/chat/messages/${userId1}/${userId2}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/chat/conversations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function markAsRead(messageId: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/chat/messages/${messageId}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

export async function getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
  const res = await fetch(`${API_BASE}/chat/messages/unread/${userId}`);
  if (!res.ok) throw new Error("Failed to get unread count");
  return res.json();
}
