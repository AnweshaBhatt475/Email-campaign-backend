const nodemailer = require('nodemailer');
const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

// Optional Redis setup
let connection;
try {
  connection = new IORedis();
} catch (err) {
  console.warn('⚠️ Redis not connected. Falling back to setTimeout()');
  connection = null;
}

const queueName = 'email-step';

let emailQueue = null;
if (connection) {
  emailQueue = new Queue(queueName, { connection });

  const queueEvents = new QueueEvents(queueName, { connection });

  const worker = new Worker(
    queueName,
    async (job) => {
      const { email, subject, body } = job.data;
      await sendEmail(email, subject, body);
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error('❌ Email job failed:', job.id, err.message);
  });
}

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Email function
const sendEmail = async (to, subject, body) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: body,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email send failed for ${to}:`, err.message);
  }
};

// ✅ Add step to queue (with fallback)
const addStepToQueue = async (email, campaignId, stepIndex, delay = 0) => {
  const subject = `Campaign Step ${stepIndex + 1}`;
  const body = `<p>This is email step ${stepIndex + 1} for your campaign.</p>`;

  if (emailQueue) {
    // With Redis
    await emailQueue.add('email-step', { email, subject, body }, { delay: delay * 1000 });
  } else {
    // Fallback (no Redis)
    console.log('⚠️ Using fallback for:', email);
    setTimeout(() => sendEmail(email, subject, body), delay * 1000);
  }
};

module.exports = {
  addStepToQueue,
};
