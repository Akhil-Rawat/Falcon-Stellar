const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    endpoint: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: String,
        required: true,
    },
    asset: {
        type: String,
        default: 'XLM',
    },
    receiver: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'General',
    },
    owner: {
        type: String,
        default: 'Anonymous',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    totalCalls: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('API', apiSchema);
