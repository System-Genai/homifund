const nodemailer = require("nodemailer");

function isMailerConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM,
  );
}

function createTransport() {
  if (!isMailerConfigured()) {
    throw new Error("Email delivery is not configured.");
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function sendMail(message) {
  const transport = createTransport();
  return transport.sendMail({
    from: process.env.SMTP_FROM,
    ...message,
  });
}

module.exports = { isMailerConfigured, sendMail };
