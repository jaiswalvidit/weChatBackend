const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    group: { type: String, trim: true },

    isGroupChat: { type: Boolean, default: false, required: true },

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],

    messages: { type: mongoose.Schema.Types.ObjectId, ref: "Message"},

    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
