// ============================================================
// NEXUS AI Chatbot - Express Server
// Serves the POST /api/chat endpoint securely.
// The GROQ_API_KEY never leaves this server.
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getChatReply } from './groqService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.json({ limit: '20kb' }));  // limit body size
app.use(cors({
  // In production, restrict to your frontend origin:
  // origin: 'https://your-vercel-app.vercel.app'
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['POST'],
}));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'NEXUS ChatBot API' });
});

// --- POST /api/chat ---
// Accepts: { message: string, history: Array<{role, content}> }
// Returns: { reply: string }
app.post('/api/chat', async (req, res) => {
  const { message, history, memory, systemPrompt } = req.body;

  // Input validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'message is too long (max 2000 characters).' });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('[NEXUS] GROQ_API_KEY is not set in .env!');
    return res.status(503).json({ error: 'AI service is not configured. Add GROQ_API_KEY to server/.env' });
  }

  let mappedHistory = [];
  if (memory) {
     mappedHistory = memory.map(m => ({ role: m.type || m.role, content: m.text || m.content }));
  } else if (history) {
     mappedHistory = history;
  }

  try {
    const reply = await getChatReply(message.trim(), mappedHistory, systemPrompt);
    return res.json({ reply });
  } catch (err) {
    console.error('[NEXUS] Groq API error:', err?.message || err);

    // Distinguish between Groq auth errors and other issues
    if (err?.status === 401) {
      return res.status(401).json({ error: 'Invalid Groq API key. Please check your server .env file.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment before sending again.' });
    }
    return res.status(500).json({ error: 'AI service is temporarily unavailable. Please try again.' });
  }
});

// --- 404 catch-all ---
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// --- Start ---
app.listen(PORT, () => {
  console.log(`\n🚀 NEXUS ChatBot API running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✓ Set' : '✗ MISSING — add to server/.env'}\n`);
});
