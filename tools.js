async function checkUserServiceStatus() {
    const response = await fetch('http://localhost:4001/status');
    const data = await response.json();
    return data;
}

async function checkPaymentServiceStatus() {
    const response = await fetch('http://localhost:4002/status');
    const data = await response.json();
    return data;
}

async function getUserServiceLogs() {
    const response = await fetch('http://localhost:4001/logs');
    const data = await response.json();
    return data;
}

async function getPaymentServiceLogs() {
    const response = await fetch('http://localhost:4002/logs');
    const data = await response.json();
    return data;
}

module.exports = {
    checkUserServiceStatus,
    checkPaymentServiceStatus,
    getUserServiceLogs,
    getPaymentServiceLogs
};