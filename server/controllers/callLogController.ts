import { Request, Response } from 'express';
import CallLog from '../models/CallLog';

export const getUserCallLogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const callLogs = await CallLog.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .sort({ startTime: -1 })
      .limit(50);

    res.status(200).json({ callLogs });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
};

export const createCallLog = async (req: Request, res: Response) => {
  try {
    const { callerId, receiverId, roomId, startTime } = req.body;

    const callLog = new CallLog({
      callerId,
      receiverId,
      roomId,
      startTime,
      endTime: null,
      duration: 0,
    });

    await callLog.save();

    res.status(201).json({ callLog });
  } catch (error) {
    console.error('Error creating call log:', error);
    res.status(500).json({ error: 'Failed to create call log' });
  }
};

export const endCallLog = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { endTime } = req.body;

    const callLog = await CallLog.findOne({ roomId, endTime: null });

    if (!callLog) {
      return res.status(404).json({ error: 'Call log not found' });
    }

    const duration = Math.floor(
      (new Date(endTime).getTime() - new Date(callLog.startTime).getTime()) / 1000
    );

    callLog.endTime = endTime;
    callLog.duration = duration;

    await callLog.save();

    res.status(200).json({ callLog });
  } catch (error) {
    console.error('Error ending call log:', error);
    res.status(500).json({ error: 'Failed to end call log' });
  }
};

export const getCallLogStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const totalCalls = await CallLog.countDocuments({
      $or: [{ callerId: userId }, { receiverId: userId }],
    });

    const callLogs = await CallLog.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    });

    const totalDuration = callLogs.reduce((sum, log) => sum + log.duration, 0);

    const averageDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;

    res.status(200).json({
      totalCalls,
      totalDuration,
      averageDuration,
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({ error: 'Failed to fetch call stats' });
  }
};
