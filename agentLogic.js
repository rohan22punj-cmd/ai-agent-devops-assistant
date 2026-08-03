require('dotenv').config();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const systemPrompt = `You are DevOps AI Assistant. Help with DevOps, deployments,
infrastructure, CI/CD, monitoring, logs, and incident troubleshooting. Give practical,
clear answers. You do not have access to live services or tools, so never claim you
checked a service, ran a command, or changed infrastructure.`;

async function runAgent(userMessage, chatHistory = []) {
  if (!userMessage || !userMessage.trim()) {
    return 'Please enter a message so I can help.';
  }

  const priorMessages = Array.isArray(chatHistory)
    ? chatHistory
        .filter((message) => message && ['user', 'agent'].includes(message.role) && message.text)
        .slice(-12)
        .map((message) => ({
          role: message.role === 'agent' ? 'assistant' : 'user',
          content: message.text,
        }))
    : [];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...priorMessages,
      { role: 'user', content: userMessage.trim() },
    ],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
}

module.exports = { runAgent };
