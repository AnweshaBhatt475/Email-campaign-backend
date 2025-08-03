// src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (to, templateId) => {
  const html = `
    <h2>Template: ${templateId}</h2>
    <img src="${process.env.BASE_URL}/track/open/${encodeURIComponent(to)}" width="1" height="1"/>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: `Campaign - ${templateId}`,
    html
  });
};
