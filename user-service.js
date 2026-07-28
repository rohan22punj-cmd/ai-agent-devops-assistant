const express = require('express');
const app = express();
const PORT = 4001;

app.use(express.json());

const fakeUsers = [
    { id: 1, name: "Rohan", status: "active" },
    { id: 2, name: "Priya", status: "active" },
    { id: 3, name: "Amit", status: "inactive" }
];

let serviceHealthy = true;

app.get("/status", (req, res) => {
    if (serviceHealthy) {
        res.json({ service: "user service", staus: "healthy", uptime: process.uptime() });
    } else {
        res.status(500).json({ service: "user-service", staus: "down" });
    }
});

app.get('/users', (req, res) => {
    res.json({ users: fakeUsers });

})
app.get('/logs', (req, res) => {
    res.json({
        logs: [
            { time: new Date().toISOString(), message: "User Priya logged in" },
            { time: new Date().toISOString(), message: "Failed login attempt for user id 3" },
            { time: new Date().toISOString(), message: "User Rohan updated profile" }
        ]
    });
});

app.post('/restart', (req, res) => {
    serviceHealthy = true;
    res.json({ message: "user-service restarted successfully", status: "healthy" });
});

app.post('/simulate-crash', (req, res) => {
    serviceHealthy = false;
    res.json({ message: "user-service is now simulated as DOWN" });
});


app.listen(PORT, () => {
    console.log(`User service running on http://localhost:${PORT}`);
});