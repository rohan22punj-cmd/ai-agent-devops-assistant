require('dotenv').config();
const OpenAI = require('openai');
const {
    checkUserServiceStatus,
    checkPaymentServiceStatus,
    getUserServiceLogs,
    getPaymentServiceLogs
} = require('./tools.js');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function testConnection() {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "user", content: "Say hello in one short sentence." }
        ]
    });

    console.log(response.choices[0].message.content);
}


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
    }
];

async function runAgent(userMessage) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "user", content: userMessage }
        ],
        tools: tools,
    });

    const message = response.choices[0].message;

    // Check if the AI wants to call a tool
    const availableFunctions = {
        checkUserServiceStatus,
        checkPaymentServiceStatus,
        getUserServiceLogs,
        getPaymentServiceLogs
    };

    if (message.tool_calls) {
        const toolCall = message.tool_calls[0];
        const functionName = toolCall.function.name;

        console.log(`AI wants to call: ${functionName}`);

        const functionToCall = availableFunctions[functionName];
        const result = await functionToCall();

        console.log("Real result from the function:", result);

        const followUp = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a monitoring assistant. When given tool results, answer ONLY using that specific data. Do not explain general concepts — just report the actual real information returned." },
                { role: "user", content: userMessage },
                message,
                {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                }
            ],
        });

        console.log("Final AI reply:", followUp.choices[0].message.content);
    } else {
        console.log("AI replied directly:", message.content);
    }
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion() {
    rl.question('Ask something (or type "exit" to quit): ', async(userInput) => {
        if (userInput.trim().toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        await runAgent(userInput);
        askQuestion(); // ask again after getting a reply
    });
}

askQuestion();