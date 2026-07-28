const express = require('express');
const app = express();
const PORT = 4002;

app.use(express.json());

const fakePayments = [
    { id: 1, amount: 500, status: "completed" },
    { id: 2, amount: 1200, status: "pending" },
    { id: 3, amount: 300, status: "failed" }
];

let serviceHealthy = true;
app.get('/status', (req, res) => {
    if (serviceHealthy) {
        res.json({ service: "payment-service", status: "healthy", uptime: process.uptime() });
    } else {
        res.status(500).json({ service: "payment-service", status: "down" });
    }
});

app.get('/payments', (req, res) => {
    res.json({ payments: fakePayments });
});

app.get('/logs', (req, res) => {
    res.json({
        logs: [
            { time: new Date().toISOString(), message: "Payment of ₹500 processed successfully" },
            { time: new Date().toISOString(), message: "Payment of ₹1200 failed" },
            { time: new Date().toISOString(), message: "system error" }
        ]
    });
});

app.post('/restart', (req, res) => {
    serviceHealthy = true;
    res.json({ message: "payment-service restarted successfully", status: "healthy" });
});

app.post('/simulate-crash', (req, res) => {
    serviceHealthy = false;
    res.json({ message: "payment-service is now simulated as DOWN" });
});

app.listen(PORT, () => {
    console.log(`Payment service running on http://localhost:${PORT}`);
});