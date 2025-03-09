const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#4285f4' },
  description: { type: String },
  filters: { type: Object }, // Criteria for auto-assignment
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
});

module.exports = mongoose.model('Group', groupSchema);
