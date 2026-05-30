import { auth } from "@chatapp/auth";
import { env } from "@chatapp/env";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Room, Message } from "@chatapp/db";

const { CORS_ORIGIN, PORT } = env;

const app = express();
// app.use(cors())
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/rooms", async (_req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 }).lean();

  if (rooms.length === 0) {
    await Room.insertMany([
      { name: "General", slug: "general", description: "Public lobby for all users", participants: [] },
      { name: "Random", slug: "random", description: "Casual chat room", participants: [] },
    ]);

    const seededRooms = await Room.find().sort({ createdAt: -1 }).lean();
    return res.json(seededRooms);
  }

  res.json(rooms);
});

app.post("/api/rooms", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Room name is required" });
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const existing = await Room.findOne({ slug });

  if (existing) {
    return res.status(409).json({ error: "A room with this name already exists" });
  }

  const room = await Room.create({
    name,
    slug,
    description,
    participants: [],
  });

  res.status(201).json(room);
});

app.get("/api/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();
  res.json(messages);
});

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId as string | undefined;

  if (!userId) {
    return next(new Error("Unauthorized"));
  }

  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;

  socket.emit("connected", { userId });

  socket.on("join-room", async ({ roomId }: { roomId: string }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
  });

  socket.on("leave-room", (roomId: string) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on("send-message", async ({ roomId, senderName, content }: { roomId: string; senderName: string; content: string }) => {
    if (!roomId || !content) return;

    const message = await Message.create({
      roomId,
      senderId: userId,
      senderName,
      content,
      read: false,
    });

    io.to(roomId).emit("message", message);
  });

  socket.on("typing", ({ roomId }: { roomId: string }) => {
    if (!roomId) return;
    socket.to(roomId).emit("typing", { senderId: userId });
  });
});

const port = Number(PORT || 3000) || 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
