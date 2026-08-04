require('dotenv').config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4002';

async function checkUserServiceStatus() {
    const response = await fetch(`${USER_SERVICE_URL}/status`);
    const data = await response.json();
    return data;
}

async function checkPaymentServiceStatus() {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/status`);
    const data = await response.json();
    return data;
}

async function getUserServiceLogs() {
    const response = await fetch(`${USER_SERVICE_URL}/logs`);
    const data = await response.json();
    return data;
}

async function getPaymentServiceLogs() {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/logs`);
    const data = await response.json();
    return data;
}

async function restartUserService() {
    const response = await fetch(`${USER_SERVICE_URL}/restart`, {
        method: 'POST',
        headers: { 'x-api-key': process.env.RESTART_API_KEY }
    });
    const data = await response.json();
    return data;
}

async function restartPaymentService() {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/restart`, {
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