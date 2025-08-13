const mongoose2 = require('mongoose');

const RoomSchema = new mongoose2.Schema({
  title: { type: String, required: true },
  isDM: { type: Boolean, default: false },
  members: [{ type: mongoose2.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose2.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose2.model('Room', RoomSchema);