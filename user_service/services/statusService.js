let serviceHealthy = true;

function isHealthy() {
    return serviceHealthy;
}

function setHealthy(value) {
    serviceHealthy = value;
}

module.exports = { isHealthy, setHealthy };