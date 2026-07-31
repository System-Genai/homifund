const test = require("node:test");
const assert = require("node:assert/strict");
const contact = require("../controllers/contact");

test("contact validation returns field-specific errors", () => {
  assert.deepEqual(
    contact.validateContactForm({
      name: "",
      email: "invalid",
      subject: "not-an-option",
      message: "",
    }),
    {
      name: "Enter your full name.",
      email: "Enter a valid email address.",
      subject: "Choose a valid subject.",
      message: "Enter a message.",
    },
  );
});

test("contact validation accepts the supported form contract", () => {
  assert.deepEqual(
    contact.validateContactForm({
      name: "Test User",
      email: "test@example.com",
      subject: "homiscore",
      message: "Please help with my verification question.",
    }),
    {},
  );
});

test("contact validation enforces input length limits", () => {
  const errors = contact.validateContactForm({
    name: "N".repeat(121),
    email: `${"e".repeat(245)}@example.com`,
    subject: "general",
    message: "M".repeat(4001),
  });

  assert.equal(errors.name, "Name must be 120 characters or fewer.");
  assert.equal(errors.email, "Enter a valid email address.");
  assert.equal(errors.message, "Message must be 4,000 characters or fewer.");
});
