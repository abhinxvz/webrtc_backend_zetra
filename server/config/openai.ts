import OpenAI from 'openai';
import env from './env';

// Using OpenRouter for access to multiple LLM models
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': env.NEXT_PUBLIC_API_BASE_URL,
    'X-Title': 'Zetra Video Conferencing',
  },
});

export default openai;
