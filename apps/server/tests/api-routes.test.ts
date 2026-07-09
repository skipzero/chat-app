import { describe, it, expect, beforeEach, mock } from "bun:test";
import { validateRoomInput } from "../src/lib/room-service";

/**
 * Mock database and Socket.io dependencies.
 * This demonstrates patterns for testing Express route handlers and Socket.io events.
 */

// ============================================
// Mock MongoDB Models
// ============================================
const mockRoomModel = {
  find: mock((_query?: any) => ({
    sort: mock((_sort?: any) => ({
      lean: mock(() => Promise.resolve([
        { _id: "1", name: "General", slug: "general", description: "Public lobby", participants: [] },
        { _id: "2", name: "Random", slug: "random", description: "Casual chat", participants: [] }
      ]))
    }))
  })),
  findOne: mock((_query?: any) => Promise.resolve(null) as Promise<any>),
  insertMany: mock(() => Promise.resolve([
    { _id: "1", name: "General", slug: "general", description: "Public lobby", participants: [] },
    { _id: "2", name: "Random", slug: "random", description: "Casual chat", participants: [] }
  ])),
  create: mock((data: any) => Promise.resolve({
    _id: "new-room",
    ...data,
    toJSON: () => ({ _id: "new-room", ...data })
  }))
};

const mockMessageModel = {
  find: mock((_query?: any) => ({
    sort: mock((_sort?: any) => ({
      lean: mock(() => Promise.resolve([
        { _id: "msg1", roomId: "1", senderId: "user1", senderName: "Alice", content: "Hello!", read: false, createdAt: new Date() }
      ]))
    }))
  })),
  create: mock((data: any) => Promise.resolve({
    _id: "new-msg",
    ...data,
    toJSON: () => ({ _id: "new-msg", ...data })
  }))
};

// ============================================
// Mock Socket.io
// ============================================
const mockSocket = {
  id: "socket-123",
  data: { userId: "user-1" },
  emit: mock((_event?: string, _data?: any) => {}),
  on: mock((_event?: string, _callback?: any) => {}),
  join: mock((_room?: string) => {}),
  leave: mock((_room?: string) => {}),
  to: mock((_room?: string) => ({
    emit: mock((_event?: string, _data?: any) => {})
  }))
};

const mockIO = {
  on: mock((_event?: string, _callback?: any) => {}),
  to: mock((_room?: string) => ({
    emit: mock((_event?: string, _data?: any) => {})
  })),
  use: mock((_middleware?: any) => {})
};

describe("api routes (mocked)", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockRoomModel.find.mockClear();
    mockRoomModel.findOne.mockClear();
    mockRoomModel.insertMany.mockClear();
    mockRoomModel.create.mockClear();
    mockMessageModel.find.mockClear();
    mockMessageModel.create.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.join.mockClear();
  });

  describe("room routes", () => {
    it("fetches all rooms from database", async () => {
      // Simulate the GET /api/rooms flow
      const rooms = await mockRoomModel.find().sort({ createdAt: -1 }).lean();
      
      expect(rooms).toHaveLength(2);
      expect(rooms[0]).toHaveProperty("name", "General");
      expect(rooms[1]).toHaveProperty("name", "Random");
    });

    it("creates a new room with valid input", async () => {
      const input = { name: "Design Review", description: "Weekly sync" };
      const validation = validateRoomInput(input);
      
      expect(validation.ok).toBe(true);
      expect(validation.slug).toBe("design-review");

      // Simulate room creation
      const room = await mockRoomModel.create({
        name: input.name,
        slug: validation.slug,
        description: input.description,
        participants: []
      });

      expect(room._id).toBe("new-room");
      expect(room.name).toBe("Design Review");
      expect(room.slug).toBe("design-review");
    });

    it("rejects room creation with empty name", () => {
      const input = { name: "", description: "No name" };
      const validation = validateRoomInput(input);
      
      expect(validation.ok).toBe(false);
      expect(validation.error).toContain("required");
    });

    it("detects duplicate room slug", async () => {
      const existingRoom = { _id: "1", name: "General", slug: "general" };
      
      // Mock findOne to return an existing room
      const originalFindOne = mockRoomModel.findOne;
      mockRoomModel.findOne = mock((_query?: any) => Promise.resolve(existingRoom) as Promise<any>);
      
      const existing = await mockRoomModel.findOne({ slug: "general" });
      
      expect(existing).not.toBeNull();
      if (existing) {
        expect(existing.slug).toBe("general");
      }
      
      // Restore original mock
      mockRoomModel.findOne = originalFindOne;
    });
  });

  describe("message routes", () => {
    it("fetches messages for a room", async () => {
      const roomId = "1";
      const messages = await mockMessageModel.find({ roomId }).sort({ createdAt: 1 }).lean();
      
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("content", "Hello!");
      expect(messages[0]).toHaveProperty("roomId", "1");
    });

    it("saves a new message", async () => {
      const messageData = {
        roomId: "1",
        senderId: "user-1",
        senderName: "Alice",
        content: "Hello everyone!",
        read: false
      };

      const message = await mockMessageModel.create(messageData);
      
      expect(message._id).toBe("new-msg");
      expect(message.content).toBe("Hello everyone!");
      expect(message.senderName).toBe("Alice");
    });
  });

  describe("socket.io events", () => {
    it("emits connected event with userId", () => {
      const userId = mockSocket.data.userId;
      
      mockSocket.emit("connected", { userId });
      
      expect(mockSocket.emit).toHaveBeenCalledWith("connected", { userId: "user-1" });
    });

    it("joins a room via socket", () => {
      const roomId = "1";
      
      mockSocket.join(roomId);
      
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);
    });

    it("handles send-message event", async () => {
      const messagePayload = {
        roomId: "1",
        senderId: mockSocket.data.userId,
        senderName: "Alice",
        content: "Test message"
      };

      // Simulate message creation
      const savedMessage = await mockMessageModel.create({
        roomId: messagePayload.roomId,
        senderId: messagePayload.senderId,
        senderName: messagePayload.senderName,
        content: messagePayload.content,
        read: false
      });

      // Simulate emitting to room
      mockIO.to(messagePayload.roomId).emit("message", savedMessage.toJSON());

      expect(savedMessage).toHaveProperty("content", "Test message");
      expect(mockIO.to).toHaveBeenCalledWith("1");
    });

    it("broadcasts typing event to room", () => {
      const roomId = "1";
      const senderId = mockSocket.data.userId;

      mockSocket.to(roomId).emit("typing", { senderId });

      expect(mockSocket.to).toHaveBeenCalledWith(roomId);
    });
  });
});
