const mongoose3 = require('mongoose');

const MessageSchema = new mongoose3.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: mongoose3.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose3.model('Message', MessageSchema);
