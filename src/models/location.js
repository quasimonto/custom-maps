const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  description: { type: String },
  type: { type: String }, // Type of meeting point
  capacity: { type: Number }
});

module.exports = mongoose.model('Location', locationSchema);
