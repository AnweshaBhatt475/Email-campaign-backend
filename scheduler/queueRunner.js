const Queue = require('bull');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const { sendEmail } = require('../utils/mailer');
const campaignQueue = new Queue('campaignQueue', process.env.REDIS_URL);

campaignQueue.process(async job => {
  const campaign = await Campaign.findById(job.data.id);
  const customers = await Customer.find();
  for (const cust of customers) {
    for (const step of campaign.steps) {
      // simple trigger check
      await sendEmail({ to: cust.email, subject: step.subject, html: step.content });
    }
  }
});

const cron = require('node-cron');
cron.schedule('* * * * *', async () => {
  const campaigns = await Campaign.find();
  campaigns.forEach(c => campaignQueue.add({ id: c._id }));
});
