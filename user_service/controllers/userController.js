const fakeUsers = [
    { id: 1, name: "Rohan", status: "active" },
    { id: 2, name: "Priya", status: "active" },
    { id: 3, name: "Amit", status: "inactive" }
];

function getUsers(req, res) {
    res.json({ users: fakeUsers });
}

module.exports = { getUsers };