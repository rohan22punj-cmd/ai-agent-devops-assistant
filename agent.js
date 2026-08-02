const { runAgent } = require('./agentLogic');
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

        const reply = await runAgent(userInput);
        console.log("AI:", reply);
        askQuestion();
    });
}
// nice man
askQuestion();