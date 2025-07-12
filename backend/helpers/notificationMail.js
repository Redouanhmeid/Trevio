require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a reusable transporter
let transporter = null;

/**
 * Initialize the email transporter with configuration
 * This allows us to create the transporter once and reuse it
 */
const initializeTransporter = () => {
 if (transporter) return transporter;

 // Use environment variables with fallbacks
 const host =
  process.env.MAIL_HOST || process.env.HOST || 'mail.nextbedesign.com';
 const port = parseInt(process.env.MAIL_PORT || '587', 10);
 const secure = port === 465; // true for 465, false for other ports

 transporter = nodemailer.createTransport({
  host: host,
  port: port,
  secure: secure,
  auth: {
   user: process.env.AUTH_EMAIL,
   pass: process.env.AUTH_PASS,
  },
  // Add some additional options for better delivery
  tls: {
   rejectUnauthorized: false, // Accept self-signed certificates
  },
  // Pool connections for better performance with multiple emails
  pool: true,
  maxConnections: 5,
  // Set reasonable timeouts
  socketTimeout: 30000, // 30 seconds
  connectionTimeout: 30000, // 30 seconds
 });

 // Verify connection configuration
 transporter.verify(function (error, success) {
  if (error) {
   console.error('SMTP connection error:', error);
  } else {
   console.log('SMTP server is ready to send messages');
  }
 });

 return transporter;
};

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Plain text version of the email
 * @param {string} [options.from] - Sender email (defaults to AUTH_EMAIL)
 * @returns {Promise} - Resolves with the send result
 */
const sendNotificationMail = async (options) => {
 try {
  const { email, subject, html, text, from } = options;

  // Initialize transporter if needed
  const emailTransporter = initializeTransporter();

  // Set up email options with defaults
  const mailOptions = {
   from: from || `"Trevio" <${process.env.AUTH_EMAIL}>`,
   to: email,
   subject: subject,
   html: html,
   // Provide plain text alternative if available
   text: text || extractTextFromHtml(html),
   // Add tracking headers
   headers: {
    'X-Entity-Ref-ID': `notification-${Date.now()}`, // Unique ID for tracking
    'X-Priority': '3', // Normal priority
   },
  };

  // Return promise for better error handling
  return await emailTransporter.sendMail(mailOptions);
 } catch (error) {
  console.error('Email sending error:', error);
  throw error;
 }
};

/**
 * Extract plain text from HTML for fallback
 * @param {string} html - HTML content
 * @returns {string} - Plain text version
 */
const extractTextFromHtml = (html) => {
 // Very basic HTML to text conversion
 return html
  .replace(/<style[^>]*>.*?<\/style>/gs, '')
  .replace(/<script[^>]*>.*?<\/script>/gs, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();
};

module.exports = sendNotificationMail;
