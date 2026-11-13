const nodemailer = require("nodemailer");
const env = require("../../config/env");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.smtpEmail,
    pass: env.smtpAppPassword,
  },
});

/**
 * Send an email via the configured SMTP transport.
 *
 * @param {{ to: string, subject: string, text: string, html: string }} options
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: `"TabibiGo" <${env.smtpEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = { sendEmail };
