const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose4 = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');
const Room = require('./models/Room');
const authRoutes = require('./auth');
const authMiddleware = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// mount auth routes
app.use('/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_strong_secret';

mongoose4.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error', err));

// Rooms API: create / list / invite
app.post('/rooms', authMiddleware, async (req, res) => {
  const { title, memberIds, isDM } = req.body;
  try{
    const room = new Room({ title, members: memberIds || [req.user.userId], createdBy: req.user.userId, isDM: !!isDM });
    await room.save();
    res.json(room);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Could not create room' }); }
});

app.get('/rooms', authMiddleware, async (req, res) => {
  try{
    const rooms = await Room.find({ members: req.user.userId }).populate('members', 'username email').lean();
    res.json(rooms);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Could not list rooms' }); }
});

app2.post('/rooms/:roomId/invite', authMiddleware2, async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  try{
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }
    res.json(room);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Invite failed' }); }
});

// Protected messages endpoint
app2.get('/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const before = req.query.before ? new Date(req.query.before) : null;
  try {
    // optionally verify membership for non-DM rooms
    const room = await Room.findOne({ $or: [{ _id: roomId }, { _id: roomId }] });
    if (room && !room.members.map(m=>String(m)).includes(String(req.user.userId))) {
      return res.status(403).json({ error: 'Not a member' });
    }

    const query = { roomId };
    if (before) query.createdAt = { $lt: before };
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

// Simple in-memory map for room participants
const participantsMap = {}; // roomId -> Set(socketId)

// Socket auth middleware: verify JWT passed in handshake.auth.token
io.use((socket, next) => {
  try{
    const token = socket.handshake.auth?.token?.split(' ')[1];
    if (!token) return next(new Error('Authentication error'));
    const payload = require('jsonwebtoken').verify(token, JWT_SECRET);
    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    return next();
  }catch(err){
    console.error('socket auth failed', err);
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, 'user', socket.data.username);

  socket.on('join_room', async ({ roomId }) => {
    // optional: check membership if using persisted rooms
    socket.join(roomId);
    socket.data.roomId = roomId;

    participantsMap[roomId] = participantsMap[roomId] || new Set();
    participantsMap[roomId].add(socket.id);

    const participants = Array.from(participantsMap[roomId]).map(id => {
      const sock = io.sockets.sockets.get(id);
      return sock ? { socketId: id, userId: sock.data.userId, userName: sock.data.username } : null;
    }).filter(Boolean);

    io.to(roomId).emit('room_participants', participants);
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    if (participantsMap[roomId]) {
      participantsMap[roomId].delete(socket.id);
      const participants = Array.from(participantsMap[roomId]).map(id => {
        const sock = io.sockets.sockets.get(id);
        return sock ? { socketId: id, userId: sock.data.userId, userName: sock.data.username } : null;
      }).filter(Boolean);
      io.to(roomId).emit('room_participants', participants);
    }
  });

  socket.on('send_message', async ({ roomId, text }) => {
    if (!roomId || !socket.data.userId || !text) return;
    const mess = new Message({ roomId, senderId: socket.data.userId, senderName: socket.data.username, text });
    try {
      await mess.save();
      io.to(roomId).emit('new_message', {
        _id: mess._id,
        roomId: mess.roomId,
        senderId: mess.senderId,
        senderName: mess.senderName,
        text: mess.text,
        createdAt: mess.createdAt
      });
    } catch (err) { console.error('save error', err); }
  });

  socket.on('typing', ({ roomId }) => {
    socket.to(roomId).emit('typing', { userId: socket.data.userId, userName: socket.data.username });
  });
  socket.on('stop_typing', ({ roomId }) => {
    socket.to(roomId).emit('stop_typing', { userId: socket.data.userId });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && participantsMap[roomId]) {
      participantsMap[roomId].delete(socket.id);
      const participants = Array.from(participantsMap[roomId]).map(id => {
        const sock = io2.sockets.sockets.get(id);
        return sock ? { socketId: id, userId: sock.data.userId, userName: sock.data.username } : null;
      }).filter(Boolean);
      io.to(roomId).emit('room_participants', participants);
    }
  });
});

server.listen(PORT, () => console.log('Server listening on', PORT));
