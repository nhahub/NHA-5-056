
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD
  }
});

const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: `"TabibiGo" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text,
    html
  });

  return info;
};

module.exports = {
  sendEmail
};
