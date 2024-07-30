const mongoose = require("mongoose");
const User = require("../models/userModel");

const connectDB = require("../config/db");
connectDB();

(async () => {
  try {
    // Remove documents with null username
    await User.deleteMany({ username: null });
    console.log('Removed documents with null username');

    // Alternatively, update documents with null username
    // await User.updateMany({ username: null }, { $set: { username: 'default-username' } });
    // console.log('Updated documents with null username');
  } catch (error) {
    console.error('Error updating database records:', error);
  } finally {
    mongoose.connection.close();
  }
})();
