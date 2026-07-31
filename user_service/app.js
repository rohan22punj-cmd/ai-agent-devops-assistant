const express = require('express');
const app = express();
const PORT = 4002;

app.use(express.json());

app.use('/', require('./routes/statusRoutes'));
app.use('/', require('./routes/paymentRoutes'));
app.use('/', require('./routes/logsRoutes'));
app.use('/', require('./routes/restartRoutes'));

app.listen(PORT, () => {
    console.log(`Payment service running on http://localhost:${PORT}`);
});