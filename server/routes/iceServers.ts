import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Get ICE servers configuration
router.get('/', (req: Request, res: Response) => {
    try {
        const iceServers = [
            // Google's public STUN servers
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },

            // Free TURN server (OpenRelay)
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
        ];

        // custom server
        if (process.env.TURN_SERVER_URL && process.env.TURN_SERVER_USERNAME) {
            iceServers.push({
                urls: process.env.TURN_SERVER_URL,
                username: process.env.TURN_SERVER_USERNAME,
                credential: process.env.TURN_SERVER_CREDENTIAL || '',
            });
        }

        logger.info('ICE servers configuration requested');

        res.status(200).json({
            iceServers,
            iceCandidatePoolSize: 10,
        });
    } catch (error: any) {
        logger.error('Error getting ICE servers', { error: error.message });
        res.status(500).json({ error: 'Failed to get ICE servers configuration' });
    }
});

export default router;
