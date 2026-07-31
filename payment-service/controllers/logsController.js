function getLogs(req, res) {
    res.json({
        logs: [
            { time: new Date().toISOString(), message: "Payment of ₹500 processed successfully" },
            { time: new Date().toISOString(), message: "Payment of ₹1200 failed" },
            { time: new Date().toISOString(), message: "system error" }
        ]
    });
}

module.exports = { getLogs };