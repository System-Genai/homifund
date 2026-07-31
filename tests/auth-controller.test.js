const test = require("node:test");
const assert = require("node:assert/strict");
const auth = require("../controllers/auth");

test("signup validation returns field-specific errors", () => {
  assert.deepEqual(
    auth.validateSignupForm({ full_name: "", email: "bad", password: "short" }),
    {
      full_name: "Enter your full name.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
    },
  );
});

test("signup validation accepts the supported form contract", () => {
  assert.deepEqual(
    auth.validateSignupForm({
      full_name: "Test User",
      email: "test@example.com",
      password: "correct-horse-battery-staple",
    }),
    {},
  );
});

test("signup validation enforces input length limits", () => {
  const errors = auth.validateSignupForm({
    full_name: "N".repeat(121),
    email: `${"e".repeat(245)}@example.com`,
    password: "p".repeat(129),
  });

  assert.equal(errors.full_name, "Name must be 120 characters or fewer.");
  assert.equal(errors.email, "Enter a valid email address.");
  assert.equal(errors.password, "Password must be 128 characters or fewer.");
});

test("login validation preserves a generic field contract", () => {
  assert.deepEqual(auth.validateLoginForm({ email: "bad", password: "" }), {
    email: "Enter a valid email address.",
    password: "Enter your password.",
  });

  assert.deepEqual(
    auth.validateLoginForm({ email: "test@example.com", password: "existing-password" }),
    {},
  );
});

test("password reset request validates email without account disclosure", () => {
  assert.equal(auth.validateResetRequestEmail("bad"), "Enter a valid email address.");
  assert.equal(auth.validateResetRequestEmail("test@example.com"), null);
});

test("new password validation enforces length and confirmation", () => {
  assert.deepEqual(auth.validateResetPassword("short", "different"), {
    password: "Use at least 8 characters.",
    passwordConfirmation: "Passwords must match.",
  });
  assert.deepEqual(auth.validateResetPassword("new-password", "new-password"), {});
});

test("role selection accepts only supported workspace values", () => {
  assert.equal(auth.validateRoleSelection("renter"), null);
  assert.equal(auth.validateRoleSelection("landlord"), null);
  assert.equal(
    auth.validateRoleSelection("admin"),
    "Choose either the renter or landlord workspace.",
  );
  assert.equal(
    auth.validateRoleSelection(""),
    "Choose either the renter or landlord workspace.",
  );
});

test("role selection assigns an unconfigured account once", async () => {
  let saved = false;
  let redirectPath = null;
  const req = {
    body: { role: " RENTER " },
    user: {
      role: null,
      async save() {
        saved = true;
      },
    },
  };
  const res = {
    redirect(path) {
      redirectPath = path;
    },
  };

  await auth.role_selection_post(req, res);

  assert.equal(saved, true);
  assert.equal(req.user.role, "renter");
  assert.equal(redirectPath, "/onboarding-tenant");
});

test("role selection rejects invalid and already-assigned changes", async () => {
  let statusCode = null;
  let rendered = null;
  const invalidReq = { body: { role: "admin" }, user: { role: null } };
  const invalidRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    render(view, locals) {
      rendered = { view, locals };
    },
  };

  await auth.role_selection_post(invalidReq, invalidRes);
  assert.equal(statusCode, 400);
  assert.equal(rendered.view, "main/role-selection");
  assert.equal(rendered.locals.selectedRole, null);

  let existingRedirect = null;
  const existingReq = {
    body: { role: "landlord" },
    user: { role: "renter" },
  };
  await auth.role_selection_post(existingReq, {
    redirect(path) {
      existingRedirect = path;
    },
  });
  assert.equal(existingReq.user.role, "renter");
  assert.equal(existingRedirect, "/user/renter/dashboard");
});
