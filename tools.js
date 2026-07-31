require('dotenv').config();

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
async function restartUserService() {
    const response = await fetch('http://localhost:4001/restart', { method: 'POST' });
    const data = await response.json();
    return data;
}

async function restartPaymentService() {
    const response = await fetch('http://localhost:4002/restart', { method: 'POST' });
    const data = await response.json();
    return data;
}
async function restartUserService() {
    const response = await fetch('http://localhost:4001/restart', {
        method: 'POST',
        headers: { 'x-api-key': process.env.RESTART_API_KEY }
    });
    const data = await response.json();
    return data;
}

async function restartPaymentService() {
    const response = await fetch('http://localhost:4002/restart', {
        method: 'POST',
        headers: { 'x-api-key': process.env.RESTART_API_KEY }
    });
    const data = await response.json();
    return data;
}

module.exports = {
    checkUserServiceStatus,
    checkPaymentServiceStatus,
    getUserServiceLogs,
    getPaymentServiceLogs,
    restartUserService,
    restartPaymentService
};