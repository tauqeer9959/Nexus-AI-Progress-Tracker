// ============================================================
// NEXUS AI Chatbot - Groq Service
// This module is the ONLY place the GROQ_API_KEY is used.
// The key is NEVER sent to the frontend.
// ============================================================

// Load .env HERE as well to handle ES module import order issues.
// dotenv.config() is idempotent — safe to call multiple times.
import 'dotenv/config';
import Groq from 'groq-sdk';

// Lazy client — instantiated on first call, AFTER env vars are loaded.
let groq = null;
function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. Create server/.env with your key.');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const SYSTEM_PROMPT = `You are NEXUS AI — a focused academic assistant for an ambitious CS student pursuing AI/ML specialization.

Your personality:
- Encouraging but precise
- Give concrete, actionable advice
- Reference specific resources when relevant (Andrew Ng, fast.ai, 3Blue1Brown, StatQuest)
- Keep responses concise (2-4 sentences ideally, max 150 words)
- Use occasional emoji to keep it engaging 🚀

Student context: 3rd semester CS student, goals include becoming an AI Scientist and pursuing a Masters abroad via scholarship.`;

/**
 * Calls Groq API and returns the AI reply.
 * @param {string} message - The latest user message
 * @param {Array} history  - Prior messages [{role, content}]
 * @param {string} customSystemPrompt - Optional dynamic system prompt
 * @returns {Promise<string>} - The AI response text
 */
export async function getChatReply(message, history = [], customSystemPrompt = null) {
  // Sanitize history: keep only last 10 turns to manage token budget
  const recentHistory = history
    .slice(-10)
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content) }));

  const finalSystemPrompt = customSystemPrompt || SYSTEM_PROMPT;

  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: finalSystemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
