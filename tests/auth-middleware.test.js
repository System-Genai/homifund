const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../models/User");
const {
  attachUser,
  getCookieMaxAge,
  getRoleHome,
  requireRole,
  signToken,
} = require("../middleware/auth");

test("cookie lifetime uses explicit milliseconds and a safe fallback", () => {
  assert.equal(getCookieMaxAge({ COOKIE_MAX_AGE_MS: "86400000" }), 86400000);
  assert.equal(getCookieMaxAge({ MAX_AGE: "604800000" }), 604800000);
  assert.equal(getCookieMaxAge({ COOKIE_MAX_AGE_MS: "invalid" }), 604800000);
  assert.equal(getCookieMaxAge({ COOKIE_MAX_AGE_MS: "-1" }), 604800000);
});

test("temporary user lookup failures preserve the authentication cookie", async () => {
  const originalFindById = User.findById;
  const lookupError = new Error("temporary database failure");
  let cleared = false;
  let nextError = null;

  User.findById = () => ({
    select: async () => {
      throw lookupError;
    },
  });

  try {
    await attachUser(
      { cookies: { token: signToken("temporary-user") } },
      { clearCookie: () => { cleared = true; } },
      (error) => { nextError = error || null; },
    );
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(cleared, false);
  assert.equal(nextError, lookupError);
});

test("invalid tokens and deleted users clear stale authentication cookies", async () => {
  let invalidTokenCleared = false;
  await attachUser(
    { cookies: { token: "not-a-valid-token" } },
    { clearCookie: () => { invalidTokenCleared = true; } },
    () => {},
  );
  assert.equal(invalidTokenCleared, true);

  const originalFindById = User.findById;
  let deletedUserCleared = false;
  User.findById = () => ({ select: async () => null });

  try {
    await attachUser(
      { cookies: { token: signToken("deleted-user") } },
      { clearCookie: () => { deletedUserCleared = true; } },
      () => {},
    );
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(deletedUserCleared, true);
});

test("role denial renders a private 403 with a safe workspace recovery", () => {
  for (const role of ["renter", "landlord", "admin", null]) {
    const currentUser = { id: "test-user", role, email: "test@example.com" };
    const req = {
      originalUrl: "/admin/verification-review?case=sensitive",
      user: currentUser,
    };
    let statusCode = null;
    let rendered = null;

    requireRole("unsupported-role")(req, {
      status(code) {
        statusCode = code;
        return this;
      },
      render(view, locals) {
        rendered = { view, locals };
      },
    });

    assert.equal(statusCode, 403);
    assert.equal(rendered.view, "main/403");
    assert.equal(rendered.locals.currentUser, currentUser);
    assert.equal(rendered.locals.userRole, role);
    assert.equal(rendered.locals.dashboardUrl, getRoleHome(role));
    assert.equal(rendered.locals.requestedUrl, req.originalUrl);
  }
});
