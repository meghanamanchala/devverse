// MongoDB connection setup

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection: SUCCESS");
  } catch (err) {
    console.error("MongoDB connection: FAILED", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;