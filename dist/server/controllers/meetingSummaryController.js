"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeetingSummary = exports.getMeetingSummaryById = exports.getMeetingSummaries = exports.createMeetingSummary = void 0;
const MeetingSummary_1 = __importDefault(require("../models/MeetingSummary"));
const logger_1 = __importDefault(require("../utils/logger"));
const openai_1 = __importDefault(require("openai"));
const env_1 = __importDefault(require("../config/env"));
const openai = new openai_1.default({
    apiKey: env_1.default.OPENAI_API_KEY,
});
const createMeetingSummary = async (req, res) => {
    try {
        const { roomId, userId, username, transcript, duration, startTime, endTime } = req.body;
        if (!roomId || !userId || !username || !transcript) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Generate AI summary using OpenRouter (supports multiple models)
        const completion = await openai.chat.completions.create({
            model: 'meta-llama/llama-3.1-8b-instruct:free', // Free model via OpenRouter
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant that summarizes meeting transcripts. 
          Provide a concise summary, extract key points, and identify action items.
          Format your response as JSON with these fields:
          - summary: A brief overview (2-3 sentences)
          - keyPoints: Array of main discussion points
          - actionItems: Array of tasks or decisions made`
                },
                {
                    role: 'user',
                    content: `Summarize this meeting transcript:\n\n${transcript}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });
        const aiResponse = completion.choices[0]?.message?.content;
        if (!aiResponse) {
            throw new Error('Failed to generate summary');
        }
        // Parse AI response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(aiResponse);
        }
        catch (parseError) {
            // Fallback if AI doesn't return valid JSON
            parsedResponse = {
                summary: aiResponse,
                keyPoints: [],
                actionItems: [],
            };
        }
        // Save to database
        const meetingSummary = new MeetingSummary_1.default({
            roomId,
            userId,
            username,
            transcript,
            summary: parsedResponse.summary || aiResponse,
            keyPoints: parsedResponse.keyPoints || [],
            actionItems: parsedResponse.actionItems || [],
            duration: duration || 0,
            startTime: startTime || new Date(),
            endTime: endTime || new Date(),
        });
        await meetingSummary.save();
        logger_1.default.info('Meeting summary created', {
            roomId,
            userId,
            summaryId: meetingSummary._id
        });
        res.status(201).json({
            success: true,
            message: 'Meeting summary created successfully',
            data: meetingSummary,
        });
    }
    catch (error) {
        logger_1.default.error('Error creating meeting summary', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to create meeting summary',
            error: error.message,
        });
    }
};
exports.createMeetingSummary = createMeetingSummary;
const getMeetingSummaries = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        const summaries = await MeetingSummary_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({
            success: true,
            data: summaries,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching meeting summaries', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting summaries',
            error: error.message,
        });
    }
};
exports.getMeetingSummaries = getMeetingSummaries;
const getMeetingSummaryById = async (req, res) => {
    try {
        const { id } = req.params;
        const summary = await MeetingSummary_1.default.findById(id);
        if (!summary) {
            return res.status(404).json({
                success: false,
                message: 'Meeting summary not found',
            });
        }
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching meeting summary', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting summary',
            error: error.message,
        });
    }
};
exports.getMeetingSummaryById = getMeetingSummaryById;
const deleteMeetingSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const summary = await MeetingSummary_1.default.findByIdAndDelete(id);
        if (!summary) {
            return res.status(404).json({
                success: false,
                message: 'Meeting summary not found',
            });
        }
        logger_1.default.info('Meeting summary deleted', { summaryId: id });
        res.status(200).json({
            success: true,
            message: 'Meeting summary deleted successfully',
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting meeting summary', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to delete meeting summary',
            error: error.message,
        });
    }
};
exports.deleteMeetingSummary = deleteMeetingSummary;
