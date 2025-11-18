"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const env_1 = __importDefault(require("./env"));
// Using OpenRouter for access to multiple LLM models
const openai = new openai_1.default({
    apiKey: env_1.default.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': env_1.default.NEXT_PUBLIC_API_BASE_URL,
        'X-Title': 'Zetra Video Conferencing',
    },
});
exports.default = openai;
