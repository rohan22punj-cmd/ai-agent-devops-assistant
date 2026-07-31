require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runAgent } = require('./agentLogic');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', async(req, res) => {
    console.log("Received body:", req.body);
    const userMessage = req.body.message;
    const reply = await runAgent(userMessage);
    res.json({ reply });
});
app.listen(3000, () => {
    console.log('Agent API running on http://localhost:3000');
});