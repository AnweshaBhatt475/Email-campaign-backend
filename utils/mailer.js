// // utils/mailer.js
// const nodemailer = require('nodemailer');

// // 🔁 Fallback to localhost if BASE_URL is not defined
// const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// // ✅ Create reusable transporter
// const transporter = nodemailer.createTransport(process.env.SMTP_URL);

// /**
//  * Sends an email with open tracking pixel and optional click tracking
//  * @param {Object} options
//  * @param {string} options.to - recipient email
//  * @param {string} options.subject - subject line
//  * @param {string} options.html - raw email body
//  * @param {string} options.customerId
//  * @param {string} options.campaignId
//  * @param {number} options.stepIndex
//  */
// exports.sendEmail = async ({ to, subject, html, customerId, campaignId, stepIndex }) => {
//   try {
//     // ✅ Append open-tracking pixel
//     const pixelUrl = `${BASE_URL}/track/open?customer=${customerId}&campaign=${campaignId}&step=${stepIndex}`;
//     const htmlWithPixel = html + `<img src="${pixelUrl}" width="1" height="1" style="display:none;" />`;

//     // ⛔ Optional: click tracking (if you want to rewrite links)
//     const htmlTracked = htmlWithPixel.replace(/href="(.*?)"/g, (match, url) => {
//       const encoded = encodeURIComponent(url);
//       const trackedUrl = `${BASE_URL}/track/click?customer=${customerId}&campaign=${campaignId}&step=${stepIndex}&url=${encoded}`;
//       return `href="${trackedUrl}"`;
//     });

//     const info = await transporter.sendMail({
//       from: process.env.SMTP_FROM,
//       to,
//       subject,
//       html: htmlTracked,
//     });

//     console.log(`✅ Email sent to ${to} (msgID: ${info.messageId})`);
//   } catch (err) {
//     console.error(`❌ Email to ${to} failed:`, err.message);
//   }
// };
