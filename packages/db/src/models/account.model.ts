import { Schema, model } from 'mongoose';

const accountSchema = new Schema(
  {
    _id: { 
      type: Schema.Types.ObjectId
    },
    accountId: { 
      type: Schema.Types.ObjectId, 
      required: true 
    },
    providerId: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    accessToken: { 
      type: String 
    },
    refreshToken: { 
      type: String 
    },
    idToken: { 
      type: String 
    },
    accessTokenExpiresAt: { 
      type: Date 
    },
    refreshTokenExpiresAt: { 
      type: Date 
    },
    scope: { 
      type: String 
    },
    password: { type: String },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "account" },
);

const Account = model("Account", accountSchema);

export default Account; 