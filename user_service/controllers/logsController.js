function getLogs(req, res) {
    res.json({
        logs: [
            { time: new Date().toISOString(), message: "User Priya logged in" },
            { time: new Date().toISOString(), message: "Failed login attempt for user id 3" },
            { time: new Date().toISOString(), message: "User Rohan updated profile" }
        ]
    });
}

module.exports = { getLogs };