const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  templateId: { type: String, required: true },        // Email template reference
  delay: { type: Number, default: 0 },                 // Delay before this step (in minutes)
  triggerType: {
    type: String,
    enum: ['time', 'open', 'click', 'purchase', 'idle'],
    default: 'time'
  },
  waitDuration: { type: Number, default: 0 },          // Wait time (minutes) to monitor behavior
  nextStepOnTrigger: { type: Number },                 // Index of next step if trigger happens
  fallbackStep: { type: Number },                      // Index of step to go to if trigger doesn't happen
  name: { type: String },                              // Optional name for visual builder
});

const flowSchema = new mongoose.Schema({
  name: { type: String, required: true },              // Campaign/Flow name
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  steps: [stepSchema],                                 // Step sequence
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flow', flowSchema);
