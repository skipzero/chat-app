import { getRooms, getRoomMessages, createRoom } from "../../src/lib/api";

// Mock fetch
global.fetch = jest.fn() as any;

describe("API functions (jest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRooms", () => {
    it("fetches all rooms", async () => {
      const mockRooms = [
        { _id: "1", name: "General", slug: "general", description: "General chat", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        { _id: "2", name: "Random", slug: "random", description: "Random topics", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
      ];

      // @ts-ignore - jest.Mock type compatibility
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRooms
      });

      const rooms = await getRooms();

      expect(rooms).toHaveLength(2);
      expect(rooms[0]).toHaveProperty("name", "General");
      expect(global.fetch).toHaveBeenCalledWith("/api/rooms", undefined);
    });

    it("throws error on failed request", async () => {
      // @ts-ignore - jest.Mock type compatibility
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getRooms()).rejects.toThrow("API request failed");
    });
  });

  describe("getRoomMessages", () => {
    it("fetches messages for a specific room", async () => {
      const mockMessages = [
        { _id: "msg1", roomId: "1", senderId: "user1", senderName: "Alice", content: "Hello!", read: false, createdAt: "2024-01-01" }
      ];

      // @ts-ignore - jest.Mock type compatibility
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages
      });

      const messages = await getRoomMessages("1");

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("content", "Hello!");
      expect(global.fetch).toHaveBeenCalledWith("/api/rooms/1/messages", undefined);
    });
  });

  describe("createRoom", () => {
    it("creates a new room", async () => {
      const newRoom = {
        _id: "new-room",
        name: "Design",
        description: "Design discussions",
        slug: "design",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      };

      // @ts-ignore - jest.Mock type compatibility
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => newRoom
      });

      const room = await createRoom("Design", "Design discussions");

      expect(room).toHaveProperty("_id", "new-room");
      expect(room).toHaveProperty("name", "Design");
    });
  });
});
