import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingSummary extends Document {
  roomId: string;
  userId: string;
  username: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  duration: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

const MeetingSummarySchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  keyPoints: [{
    type: String,
  }],
  actionItems: [{
    type: String,
  }],
  duration: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMeetingSummary>('MeetingSummary', MeetingSummarySchema);
