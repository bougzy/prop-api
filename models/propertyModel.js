

const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  localGovernment: { type: String, required: true },
  images: [{
    data: Buffer,
    contentType: String
  }],
  videos: [{
    data: Buffer,
    contentType: String
  }]
});

module.exports = mongoose.model("Property", PropertySchema);
