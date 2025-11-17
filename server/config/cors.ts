import { CorsOptions } from 'cors';
import logger from '../utils/logger';

const allowedOrigins = [
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4000',
];

export const corsOptions: CorsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};
