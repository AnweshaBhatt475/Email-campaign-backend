// const mongoose = require('mongoose');
// const CustomerSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   data: mongoose.Schema.Types.Mixed
// });
// module.exports = mongoose.model('Customer', CustomerSchema);


const mongoose = require('mongoose');

const campaignProgressSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  currentStep: { type: Number, default: 0 },
  lastStepAt: { type: Date },
  triggers: [
    {
      stepIndex: Number,
      type: String, // open, click, idle, purchase
      timestamp: Date
    }
  ],
  completed: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  // Additional data fields from Excel
  campaigns: [campaignProgressSchema]
});

module.exports = mongoose.model('Customer', customerSchema);
