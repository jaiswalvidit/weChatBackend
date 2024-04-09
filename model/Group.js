const mongoose = require('mongoose');

// Define the schema for the group
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    messages: {
        type: String
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Group model using the schema
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
