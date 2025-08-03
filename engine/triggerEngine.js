const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const campaignState = {};

const triggerCampaigns = async () => {
  const campaigns = await Campaign.find({});

  for (const campaign of campaigns) {
    if (!campaignState[campaign._id]) {
      campaignState[campaign._id] = { step: 0, lastSent: 0 };
    }

    const state = campaignState[campaign._id];
    const now = Date.now();

    const currentStep = campaign.steps[state.step];
    if (!currentStep) continue;

    const elapsed = now - state.lastSent;
    const delayMs = currentStep.delay * 60 * 1000;

    if (elapsed >= delayMs) {
      const customers = await Customer.find({ campaignId: campaign._id });

      for (const customer of customers) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject: `Step ${state.step + 1}: ${currentStep.templateId}`,
          text: `Sending email from template ID: ${currentStep.templateId}`
        });
      }

      state.step++;
      state.lastSent = now;
      console.log(`✅ Sent step ${state.step} for campaign ${campaign.name}`);
    }
  }
};

// Cron Job every minute
cron.schedule('* * * * *', async () => {
  console.log('⏰ Running campaign trigger engine...');
  await triggerCampaigns();
});

module.exports = triggerCampaigns;
