import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  active: boolean;
}

const RoomSchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<IRoom>('Room', RoomSchema);
