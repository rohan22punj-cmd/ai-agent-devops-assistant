require('dotenv').config();
const OpenAI = require('openai');
const {
  checkUserServiceStatus,
  checkPaymentServiceStatus,
  getUserServiceLogs,
  getPaymentServiceLogs,
  restartUserService,
  restartPaymentService,
} = require('./tools');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const systemPrompt = `You are DevOps AI Assistant. Help with DevOps, deployments,
infrastructure, CI/CD, monitoring, logs, and incident troubleshooting. Give practical,
clear answers. You do not have access to live services or tools, so never claim you
checked a service, ran a command, or changed infrastructure.`;

function requestedServices(message) {
  const mentionsUser = /\buser(?:[- ]service)?\b/i.test(message);
  const mentionsPayment = /\bpayment(?:[- ]service)?\b/i.test(message);

  if (mentionsUser && !mentionsPayment) return ['user'];
  if (mentionsPayment && !mentionsUser) return ['payment'];
  return ['user', 'payment'];
}

function getLiveRequest(message) {
  const asksForRestart = /\b(restart|start again|bring .* back)\b/i.test(message);
  const asksForLogs = /\b(logs?|recent|what happened|activity|errors?)\b/i.test(message);
  const asksForStatus = /\b(status|healthy|health|okay|ok|working|up|down|available)\b/i.test(message);

  if (asksForRestart) return 'restart';
  if (asksForLogs) return 'logs';
  if (asksForStatus) return 'status';
  return null;
}

async function getLiveAnswer(type, services) {
  const operations = {
    user: {
      status: checkUserServiceStatus,
      logs: getUserServiceLogs,
      restart: restartUserService,
    },
    payment: {
      status: checkPaymentServiceStatus,
      logs: getPaymentServiceLogs,
      restart: restartPaymentService,
    },
  };

  const results = await Promise.all(services.map(async (service) => {
    try {
      const data = await operations[service][type]();
      return { service, data };
    } catch (error) {
      return { service, error: error.message };
    }
  }));

  return results.map(({ service, data, error }) => {
    const label = service === 'user' ? 'User service' : 'Payment service';
    if (error) return `${label}: unavailable — ${error}.`;

    if (type === 'status') {
      return `${label}: ${data.status || 'unknown'}${data.uptime ? ` (uptime: ${Math.floor(data.uptime)} seconds)` : ''}.`;
    }
    if (type === 'restart') {
      return `${label}: ${data.message || 'restart requested'}.`;
    }

    const logs = Array.isArray(data.logs) ? data.logs : [];
    const entries = logs.map((log) => `• ${log.message}`).join('\n');
    return `${label} logs:\n${entries || 'No log entries returned.'}`;
  }).join('\n\n');
}

async function runAgent(userMessage, chatHistory = []) {
  if (!userMessage || !userMessage.trim()) {
    return 'Please enter a message so I can help.';
  }

  const liveRequest = getLiveRequest(userMessage);
  if (liveRequest) {
    return getLiveAnswer(liveRequest, requestedServices(userMessage));
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
