const { isMailerConfigured, sendMail } = require("../utils/mailer");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SUBJECTS = new Set([
  "general",
  "renter",
  "landlord",
  "homiscore",
]);

function validateContactForm(form) {
  const fieldErrors = {};

  if (!form.name) {
    fieldErrors.name = "Enter your full name.";
  } else if (form.name.length > 120) {
    fieldErrors.name = "Name must be 120 characters or fewer.";
  }

  if (!EMAIL_PATTERN.test(form.email) || form.email.length > 254) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!ALLOWED_SUBJECTS.has(form.subject)) {
    fieldErrors.subject = "Choose a valid subject.";
  }

  if (!form.message) {
    fieldErrors.message = "Enter a message.";
  } else if (form.message.length > 4000) {
    fieldErrors.message = "Message must be 4,000 characters or fewer.";
  }

  return fieldErrors;
}

exports.show = (req, res) => {
  res.render("main/contact", {
    title: "Contact | HomiFund",
    form: {},
    fieldErrors: {},
    error: null,
    success: null,
  });
};

exports.submit = async (req, res) => {
  const form = {
    name: String(req.body.name || "").trim(),
    email: String(req.body.email || "").trim().toLowerCase(),
    subject: String(req.body.subject || "general").trim(),
    message: String(req.body.message || "").trim(),
  };
  const fieldErrors = validateContactForm(form);

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render("main/contact", {
      title: "Contact | HomiFund",
      form,
      fieldErrors,
      error: "Review the highlighted fields and try again.",
      success: null,
    });
  }

  if (!isMailerConfigured()) {
    return res.status(503).render("main/contact", {
      title: "Contact | HomiFund",
      form,
      fieldErrors: {},
      error:
        "Online message delivery is not configured yet. Please email support@homifund.com directly.",
      success: null,
    });
  }

  try {
    await sendMail({
      to: process.env.CONTACT_TO || "support@homifund.com",
      replyTo: form.email,
      subject: `[HomiFund contact] ${form.subject}`,
      text: `From: ${form.name} <${form.email}>\n\n${form.message}`,
    });

    return res.render("main/contact", {
      title: "Contact | HomiFund",
      form: {},
      fieldErrors: {},
      error: null,
      success: "Your message has been sent. Our support team will reply by email.",
    });
  } catch (error) {
    console.error("Contact email error:", error.message);
    return res.status(502).render("main/contact", {
      title: "Contact | HomiFund",
      form,
      fieldErrors: {},
      error:
        "We could not send your message. Try again or email support@homifund.com directly.",
      success: null,
    });
  }
};

exports.validateContactForm = validateContactForm;
