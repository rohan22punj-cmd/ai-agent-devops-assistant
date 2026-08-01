const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
    question: String,
    toolCalled: String,
    result: Object,
    autoRestarted: Boolean,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionLog', actionLogSchema);