const fakePayments = [
    { id: 1, amount: 500, status: "completed" },
    { id: 2, amount: 1200, status: "pending" },
    { id: 3, amount: 300, status: "failed" }
];

function getPayments(req, res) {
    res.json({ payments: fakePayments });
}

module.exports = { getPayments };