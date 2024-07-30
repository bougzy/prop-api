const mongoose = require("mongoose");

// Replace this string with your actual MongoDB connection string
const mongoURI = "mongodb+srv://dub:dub@dub.92zzeme.mongodb.net/dub";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
