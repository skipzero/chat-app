const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const API_BASE = `${SERVER_URL}/api`;
async function fetchJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
    }
    return res.json();
}
export async function getRooms() {
    return fetchJson(`${API_BASE}/rooms`);
}
export async function getRoomMessages(roomId) {
    return fetchJson(`${API_BASE}/rooms/${roomId}/messages`);
}
export async function createRoom(name, description) {
    return fetchJson(`${API_BASE}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
    });
}
export async function sendMessage(senderId, receiverId, content) {
    const res = await fetch(`${API_BASE}/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId, content }),
    });
    if (!res.ok)
        throw new Error("Failed to send message");
    return res.json();
}
export async function getMessages(userId1, userId2) {
    const res = await fetch(`${API_BASE}/chat/messages/${userId1}/${userId2}`);
    if (!res.ok)
        throw new Error("Failed to fetch messages");
    return res.json();
}
export async function getConversations(userId) {
    const res = await fetch(`${API_BASE}/chat/conversations/${userId}`);
    if (!res.ok)
        throw new Error("Failed to fetch conversations");
    return res.json();
}
export async function markAsRead(messageId) {
    const res = await fetch(`${API_BASE}/chat/messages/${messageId}/read`, { method: "PUT" });
    if (!res.ok)
        throw new Error("Failed to mark as read");
    return res.json();
}
export async function getUnreadCount(userId) {
    const res = await fetch(`${API_BASE}/chat/messages/unread/${userId}`);
    if (!res.ok)
        throw new Error("Failed to get unread count");
    return res.json();
}
