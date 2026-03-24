import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, systemPrompt, memory } = req.body;

    const messages = [
      { role: "system", content: systemPrompt },
      ...memory.map(m => ({ role: m.type, content: m.text })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
    });

    res.status(200).json({ reply: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: error.message || 'Failed to communicate with AI Mentor' });
  }
}
