const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  const url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not configured.");
  }

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected Success");
    return mongoose.connection;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};



module.exports = connectDB;
