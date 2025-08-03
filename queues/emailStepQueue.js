// queues/emailStepQueue.js
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const nodemailer = require('../utils/nodemailer'); // Ensure this exists!

// 🔌 Optional Redis connection
let connection = null;
try {
  connection = new IORedis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
  });

  connection.on('error', (err) => {
    console.warn('❌ Redis connection failed:', err.message);
    connection = null;
  });
} catch (err) {
  console.warn('❌ Redis connection setup failed:', err.message);
  connection = null;
}

// 📨 Queue setup if Redis is available
let emailStepQueue = null;

if (connection) {
  emailStepQueue = new Queue('email-steps', { connection });

  const worker = new Worker(
    'email-steps',
    async (job) => {
      const { customerId, campaignId, stepIndex } = job.data;

      const campaign = await Campaign.findById(campaignId);
      const customer = await Customer.findById(customerId);

      if (!campaign || !customer) {
        console.warn(`⚠️ Missing campaign or customer for job ${job.id}`);
        return;
      }

      const step = campaign.steps?.[stepIndex];
      if (!step) return;

      await nodemailer.sendMail({
        to: customer.email,
        subject: `Email from ${campaign.name}`,
        html: `<p>Step ${stepIndex + 1} - Template ID: ${step.templateId}</p>`,
      });

      const nextStep = campaign.steps?.[stepIndex + 1];
      if (nextStep) {
        const delayMs = nextStep.delay * 24 * 60 * 60 * 1000; // days to ms
        await emailStepQueue.add('email-step', {
          customerId,
          campaignId,
          stepIndex: stepIndex + 1,
        }, { delay: delayMs });
      }
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error('❌ Email job failed:', job.id, err.message);
  });
}

// 🛠️ Fallback logic (if Redis not available)
const fallbackSendStep = async (customerId, campaignId, stepIndex, delaySec) => {
  setTimeout(async () => {
    const campaign = await Campaign.findById(campaignId);
    const customer = await Customer.findById(customerId);
    if (!campaign || !customer) return;

    const step = campaign.steps?.[stepIndex];
    if (!step) return;

    await nodemailer.sendMail({
      to: customer.email,
      subject: `Email from ${campaign.name}`,
      html: `<p>Step ${stepIndex + 1} - Template ID: ${step.templateId}</p>`,
    });

    const nextStep = campaign.steps?.[stepIndex + 1];
    if (nextStep) {
      fallbackSendStep(customerId, campaignId, stepIndex + 1, nextStep.delay * 86400);
    }
  }, delaySec * 1000);
};

// 🔁 Add step to queue or fallback
const addStepToQueue = async (email, campaignId, stepIndex = 0, delay = 0) => {
  const customer = await Customer.findOne({ email, campaignId });
  if (!customer) return;

  if (emailStepQueue) {
    await emailStepQueue.add('email-step', {
      customerId: customer._id,
      campaignId,
      stepIndex,
    }, { delay: delay * 1000 });
  } else {
    fallbackSendStep(customer._id, campaignId, stepIndex, delay);
  }
};

module.exports = {
  addStepToQueue,
};
