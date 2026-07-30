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
        { role: "system", content: "You are a DevOps assistant monitoring backend services. Report real data clearly and briefly." },
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

            console.log(`AI wants to call: ${functionName}`);

            const functionToCall = availableFunctions[functionName];
            let result = await functionToCall();

            console.log("Real result from the function:", result);

            if (restartMap[functionName] && result.status === "down") {
                console.log(`Detected service is DOWN. Auto-restarting using ${restartMap[functionName]}...`);
                const restartResult = await availableFunctions[restartMap[functionName]]();
                console.log("Restart result:", restartResult);
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

            console.log("Final AI reply:", followUp.choices[0].message.content);
        } else {
            console.log("AI replied directly:", message.content);
        }
    } catch (error) {
        console.log("Something went wrong talking to the AI. Try rephrasing your question, or try again.");
        console.log("(Technical detail:", error.message, ")");
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