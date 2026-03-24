# NEXUS AI ChatBot — Backend API Server

This Express server handles AI chat requests securely using the Groq SDK.

## Quick Start

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Create your .env file
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

Get a free Groq API key at: https://console.groq.com/keys

### 3. Start the API server
```bash
# In the /server directory:
node server.js

# Or with file watching (Node 18+):
node --watch server.js
```

### 4. Start the Vite frontend (in a separate terminal)
```bash
# In the project root:
npm run dev
```

Vite will proxy `/api/*` requests to `http://localhost:3001` automatically.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/chat | Send a message to the AI |

### POST /api/chat

**Request body:**
```json
{
  "message": "What should I study next?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**
```json
{ "reply": "Based on your progress, I'd recommend..." }
```

## Security

- `GROQ_API_KEY` lives only in `server/.env` — never sent to the browser
- CORS is restricted to localhost dev origins (update in production)
- Input is validated and length-limited (max 2000 chars)
- Body size limited to 20KB
