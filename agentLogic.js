require('dotenv').config();
const OpenAI = require('openai');
const {
    checkUserServiceStatus,
    checkPaymentServiceStatus,
    getUserServiceLogs,
    getPaymentServiceLogs,
    restartUserService,
    restartPaymentService
} = require('./tools.js');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const tools = [{
        type: "function",
        function: {
            name: "checkUserServiceStatus",
            description: "Checks whether the user service is running and healthy",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "checkPaymentServiceStatus",
            description: "Checks whether the payment service is running and healthy",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserServiceLogs",
            description: "Gets recent log messages from the user service",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "getPaymentServiceLogs",
            description: "Gets recent log messages from the payment service",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "restartUserService",
            description: "Restarts the user service. Use this when the user service is down or unhealthy.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "restartPaymentService",
            description: "Restarts the payment service. Use this when the payment service is down or unhealthy.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    }
];

async function runAgent(userMessage) {
    const availableFunctions = {
        checkUserServiceStatus,
        checkPaymentServiceStatus,
        getUserServiceLogs,
        getPaymentServiceLogs,
        restartUserService,
        restartPaymentService
    };

    const restartMap = {
        checkUserServiceStatus: "restartUserService",
        checkPaymentServiceStatus: "restartPaymentService"
    };

    let messages = [
        { role: "system", content: "You are a DevOps assistant monitoring backend services. Only report on the specific service the user asked about. Do not check or mention other services unless explicitly asked. Never invent or assume data that wasn't returned by a real tool call. If a service is reported as down or unhealthy, mention that it will be auto-restarted." },
        { role: "user", content: userMessage }
    ];

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: tools,
        });

        const message = response.choices[0].message;
        messages.push(message);

        if (message.tool_calls) {
            const toolCall = message.tool_calls[0];
            const functionName = toolCall.function.name;

            const functionToCall = availableFunctions[functionName];
            let result = await functionToCall();

            if (restartMap[functionName] && result.status === "down") {
                const restartResult = await availableFunctions[restartMap[functionName]]();
                result = {...result, restartAction: restartResult };
            }

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
            });

            const followUp = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages,
            });

            return followUp.choices[0].message.content;
        } else {
            return message.content;
        }
    } catch (error) {
        return "Something went wrong talking to the AI. Try rephrasing your question, or try again. (" + error.message + ")";
    }
}

module.exports = { runAgent };