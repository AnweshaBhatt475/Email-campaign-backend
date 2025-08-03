const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  templateId: String,
  trigger: String, // 'immediate', 'open', 'click', 'purchase'
  delay: Number,   // in minutes
});

const campaignSchema = new mongoose.Schema({
  name: String,
  contacts: [String],
  steps: [stepSchema],
});

module.exports = mongoose.model('Campaign', campaignSchema);
