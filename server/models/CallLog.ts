import mongoose, { Schema, Document } from 'mongoose';

export interface ICallLog extends Document {
  callerId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  roomId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

const CallLogSchema: Schema = new Schema({
  callerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

export default mongoose.model<ICallLog>('CallLog', CallLogSchema);
