// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },  // Clerk userId
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const reportSchema = new mongoose.Schema({
  user: { type: String, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    image: { type: String }, // Cloudinary URL
    author: { type: String, required: true }, // Clerk userId
    likes: [String], // array of Clerk userIds
    comments: [commentSchema],
    tags: [{ type: String }],
    reports: [reportSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
