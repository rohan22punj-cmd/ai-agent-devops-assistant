require('dotenv').config({ path: '../.env' });

function checkApiKey(req, res, next) {
    const providedKey = req.headers['x-api-key'];

    if (providedKey === process.env.RESTART_API_KEY) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized - invalid or missing API key" });
    }
}

module.exports = { checkApiKey };