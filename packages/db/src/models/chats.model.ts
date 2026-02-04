import { Schema, model } from 'mongoose'

const chatSchema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGrounpChat: { type: Boolean, default: false },
    users: [
      {
        type: Schema.Types.ObjectId, 
        ref: 'User',
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { 
    timestamps: true, 
    collection: 'chat'
  }
  
)

const Chat = model('Chat', chatSchema)

export default Chat