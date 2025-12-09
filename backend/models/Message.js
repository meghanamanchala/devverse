const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },   // Clerk userId
  receiver: { type: String, required: true }, // Clerk userId
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);