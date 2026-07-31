const express = require('express');
const app = express();
const PORT = 4001;

app.use(express.json());

app.use('/', require('./routes/statusRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/logsRoutes'));
app.use('/', require('./routes/restartRoutes'));

app.listen(PORT, () => {
    console.log(`User service running on http://localhost:${PORT}`);
});