const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const Campaign = require('../models/Campaign');
const { sendEmail } = require('../utils/sendEmail');

const connection = new IORedis();
const campaignQueue = new Queue('campaign-steps', { connection });

const addStepToQueue = async (email, campaignId, stepIndex, delayMinutes) => {
  await campaignQueue.add(
    'send-step',
    { email, campaignId, stepIndex },
    { delay: delayMinutes * 60 * 1000 }
  );
};

const worker = new Worker('campaign-steps', async (job) => {
  const { email, campaignId, stepIndex } = job.data;
  const campaign = await Campaign.findById(campaignId);
  const step = campaign.steps[stepIndex];

  await sendEmail(email, step.templateId);

  console.log(`✅ Sent ${step.templateId} to ${email}`);

  const next = campaign.steps[stepIndex + 1];
  if (!next) return;

  if (next.trigger === 'time_delay') {
    await addStepToQueue(email, campaignId, stepIndex + 1, next.delay || 0);
  }
  // If trigger is open/click/etc: wait for tracking events
}, { connection });

module.exports = { addStepToQueue };
