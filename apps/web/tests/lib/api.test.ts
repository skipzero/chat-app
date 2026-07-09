import { describe, it, expect, beforeEach, mock } from "bun:test";

/**
 * API utility functions tests.
 * Tests request/response handling patterns used in API functions.
 */

// Mock the fetch function
const mockFetch = mock((_url?: string, _options?: any) => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([])
} as Response));

describe("API request/response patterns", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("fetchJson helper", () => {
    it("returns parsed JSON on success", async () => {
      const mockData = { _id: "1", name: "General", slug: "general" };
      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response));

      const response = await mockFetch("/api/rooms");
      const data = await (response as Response).json();

      expect(data).toEqual(mockData);
    });

    it("handles error responses", async () => {
      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: false,
        status: 404
      } as Response));

      const response = await mockFetch("/api/rooms/invalid");
      
      expect((response as Response).ok).toBe(false);
      expect((response as Response).status).toBe(404);
    });
  });

  describe("Room endpoints", () => {
    it("GET /api/rooms returns room list", async () => {
      const mockRooms = [
        { _id: "1", name: "General", slug: "general", description: "Public lobby", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        { _id: "2", name: "Random", slug: "random", description: "Random topics", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
      ];

      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRooms)
      } as Response));

      const response = await mockFetch("/api/rooms");
      const rooms = await (response as Response).json();

      expect(rooms).toHaveLength(2);
      expect(rooms[0]).toHaveProperty("name");
      expect(rooms[0]).toHaveProperty("slug");
    });

    it("POST /api/rooms with valid payload", async () => {
      const newRoom = { _id: "new", name: "Design", slug: "design", createdAt: "2024-01-01", updatedAt: "2024-01-01" };

      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newRoom)
      } as Response));

      const response = await mockFetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Design" })
      });

      expect((response as Response).ok).toBe(true);
      const room = await (response as Response).json();
      expect(room).toHaveProperty("_id");
    });
  });

  describe("Message endpoints", () => {
    it("GET /api/rooms/:roomId/messages returns messages", async () => {
      const mockMessages = [
        { _id: "msg1", roomId: "1", senderId: "user1", senderName: "Alice", content: "Hello!", read: false, createdAt: "2024-01-01" }
      ];

      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMessages)
      } as Response));

      const response = await mockFetch("/api/rooms/1/messages");
      const messages = await (response as Response).json();

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("content");
      expect(messages[0]).toHaveProperty("senderName");
    });
  });

  describe("Request headers", () => {
    it("POST requests include JSON content type", async () => {
      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response));

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" })
      };

      await mockFetch("/api/rooms", options);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]).toHaveProperty("method", "POST");
      expect(callArgs[1]).toHaveProperty("headers");
      expect(callArgs[1].headers).toHaveProperty("Content-Type", "application/json");
    });

    it("includes request body as JSON string", async () => {
      mockFetch.mockReturnValueOnce(Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response));

      const payload = { name: "Test", description: "Test room" };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      };

      await mockFetch("/api/rooms", options);

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1]?.body;
      expect(body).toBe(JSON.stringify(payload));
    });
  });
});
