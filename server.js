require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runAgent } = require('./agentLogic');

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));


app.post('/ask', async(req, res) => {
    console.log("Received body:", req.body);
    const userMessage = req.body.message;
    const reply = await runAgent(userMessage);
    res.json({ reply });
});

const ActionLog = require('./models/ActionLog');

app.get('/history', async(req, res) => {
    const logs = await ActionLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
});


app.listen(3000, () => {
    console.log('Agent API running on http://localhost:3000');
});