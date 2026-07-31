const test = require("node:test");
const assert = require("node:assert/strict");
const onboarding = require("../controllers/onboarding");
const User = require("../models/User");

function completeProfile(overrides = {}) {
  return {
    legalName: "Test Landlord",
    landlordType: "individual",
    businessName: "",
    propertyCount: "3",
    primaryLocations: "Manchester",
    propertyTypes: ["apartments"],
    managementStyle: "self-managed",
    primaryGoal: "manage-properties",
    ...overrides,
  };
}

function completeRenterProfile(overrides = {}) {
  return {
    legalName: "Test Renter",
    phone: "+44 7700 900123",
    householdSize: "two",
    petStatus: "none",
    employmentStatus: "employed",
    jobTitle: "Analyst",
    employer: "Example Ltd",
    monthlyBudget: "1800",
    preferredLocations: "Manchester",
    propertyType: "apartment",
    moveInDate: "2026-09-01",
    ...overrides,
  };
}

test("landlord onboarding normalizes the supported form contract", () => {
  assert.deepEqual(
    onboarding.normalizeLandlordProfile({
      ...completeProfile(),
      legalName: "  Test Landlord  ",
      propertyTypes: ["apartments", "unsupported", "houses"],
    }),
    {
      ...completeProfile(),
      propertyTypes: ["apartments", "houses"],
    },
  );
});

test("landlord onboarding requires complete data before continuing", () => {
  assert.deepEqual(
    onboarding.validateLandlordProfile(completeProfile({
      legalName: "",
      landlordType: "",
      propertyCount: "-1",
      primaryLocations: "",
      propertyTypes: [],
      managementStyle: "",
      primaryGoal: "",
    })),
    {
      legalName: "Enter the legal name used for this account.",
      landlordType: "Choose an account type.",
      propertyCount: "Enter a whole number from 0 to 100,000.",
      primaryLocations: "Enter at least one operating location.",
      propertyTypes: "Choose at least one property type.",
      managementStyle: "Choose a management style.",
      primaryGoal: "Choose the first task you want to focus on.",
    },
  );
});

test("landlord onboarding allows valid partial drafts", () => {
  assert.deepEqual(
    onboarding.validateLandlordProfile(
      completeProfile({
        landlordType: "",
        propertyCount: "",
        primaryLocations: "",
        propertyTypes: [],
        managementStyle: "",
        primaryGoal: "",
      }),
      { draft: true },
    ),
    {},
  );
});

test("landlord onboarding saves a partial draft and supports resuming", async () => {
  let saved = false;
  let redirectedTo = null;
  const req = {
    body: {
      legalName: "Draft Landlord",
      intent: "draft",
    },
    user: {
      fullName: "Draft Landlord",
      async save() {
        saved = true;
      },
    },
  };

  await onboarding.landlord_post(req, {
    redirect(path) {
      redirectedTo = path;
    },
  });

  assert.equal(saved, true);
  assert.equal(redirectedTo, "/onboarding-landlord?saved=1");
  assert.equal(req.user.landlordProfile.legalName, "Draft Landlord");
  assert.equal(req.user.landlordProfile.landlordType, undefined);
  assert.deepEqual(req.user.landlordProfile.propertyTypes, []);
});

test("landlord draft shape satisfies the Mongoose model", async () => {
  const user = new User({
    fullName: "Draft Landlord",
    email: "draft-landlord@example.com",
    password: "not-yet-hashed",
    role: "landlord",
    landlordProfile: {
      legalName: "Draft Landlord",
      propertyTypes: [],
      updatedAt: new Date(),
    },
  });

  await assert.doesNotReject(() => user.validate());
});

test("landlord onboarding continues only after a complete valid profile", async () => {
  let redirectedTo = null;
  const req = {
    body: { ...completeProfile(), intent: "continue" },
    user: {
      async save() {},
    },
  };

  await onboarding.landlord_post(req, {
    redirect(path) {
      redirectedTo = path;
    },
  });

  assert.equal(redirectedTo, "/landlord-verification");
  assert.equal(req.user.landlordProfile.propertyCount, 3);
});

test("landlord onboarding returns field errors without saving", async () => {
  let statusCode = null;
  let rendered = null;
  let saved = false;
  const req = {
    body: { intent: "continue" },
    user: {
      fullName: "Test Landlord",
      async save() {
        saved = true;
      },
    },
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    render(view, locals) {
      rendered = { view, locals };
    },
  };

  await onboarding.landlord_post(req, res);

  assert.equal(statusCode, 400);
  assert.equal(saved, false);
  assert.equal(rendered.view, "main/onboarding-landlord");
  assert.equal(rendered.locals.fieldErrors.landlordType, "Choose an account type.");
});

test("renter onboarding normalizes and validates the supported profile", () => {
  const normalized = onboarding.normalizeRenterProfile({
    ...completeRenterProfile(),
    legalName: "  Test Renter  ",
  });

  assert.equal(normalized.legalName, "Test Renter");
  assert.deepEqual(onboarding.validateRenterProfile(normalized), {});
});

test("renter onboarding rejects incomplete and malformed data", () => {
  const errors = onboarding.validateRenterProfile(completeRenterProfile({
    legalName: "",
    phone: "12",
    householdSize: "",
    petStatus: "",
    employmentStatus: "",
    monthlyBudget: "-1",
    preferredLocations: "",
    propertyType: "",
    moveInDate: "not-a-date",
  }));

  assert.equal(errors.legalName, "Enter the legal name used for this account.");
  assert.equal(errors.phone, "Enter a valid phone number with 7 to 15 digits.");
  assert.equal(errors.householdSize, "Choose a household size.");
  assert.equal(errors.petStatus, "Choose a pet status.");
  assert.equal(errors.employmentStatus, "Choose your current employment status.");
  assert.equal(errors.monthlyBudget, "Enter an amount from 0 to 1,000,000.");
  assert.equal(errors.preferredLocations, "Enter at least one preferred location.");
  assert.equal(errors.propertyType, "Choose a property type.");
  assert.equal(errors.moveInDate, "Enter a valid move-in date.");
});

test("renter onboarding saves a partial draft that satisfies the model", async () => {
  let redirectedTo = null;
  const req = {
    body: { legalName: "Draft Renter", intent: "draft" },
    user: {
      fullName: "Draft Renter",
      async save() {},
    },
  };

  await onboarding.renter_post(req, {
    redirect(path) {
      redirectedTo = path;
    },
  });

  assert.equal(redirectedTo, "/onboarding-tenant?saved=1");
  assert.equal(req.user.renterProfile.householdSize, undefined);

  const user = new User({
    fullName: "Draft Renter",
    email: "draft-renter@example.com",
    password: "not-yet-hashed",
    role: "renter",
    renterProfile: req.user.renterProfile,
  });
  await assert.doesNotReject(() => user.validate());
});

test("renter onboarding continues after a complete valid profile", async () => {
  let redirectedTo = null;
  const req = {
    body: { ...completeRenterProfile(), intent: "continue" },
    user: { async save() {} },
  };

  await onboarding.renter_post(req, {
    redirect(path) {
      redirectedTo = path;
    },
  });

  assert.equal(redirectedTo, "/tenant-verification");
  assert.equal(req.user.renterProfile.monthlyBudget, 1800);
  assert.equal(
    req.user.renterProfile.moveInDate.toISOString().slice(0, 10),
    "2026-09-01",
  );

  const user = new User({
    fullName: "Test Renter",
    email: "complete-renter@example.com",
    password: "not-yet-hashed",
    role: "renter",
    renterProfile: req.user.renterProfile,
  });
  await assert.doesNotReject(() => user.validate());
});

test("onboarding completion resumes incomplete profiles", () => {
  let redirectedTo = null;

  onboarding.complete_get(
    {
      user: {
        role: "renter",
        fullName: "Incomplete Renter",
        renterProfile: undefined,
      },
    },
    {
      redirect(path) {
        redirectedTo = path;
      },
    },
  );

  assert.equal(redirectedTo, "/onboarding-tenant");
});

test("onboarding completion renders role-specific destinations", () => {
  let rendered = null;
  const profile = completeProfile();

  onboarding.complete_get(
    {
      user: {
        role: "landlord",
        fullName: profile.legalName,
        landlordProfile: {
          ...profile,
          propertyCount: Number(profile.propertyCount),
        },
      },
    },
    {
      render(view, locals) {
        rendered = { view, locals };
      },
    },
  );

  assert.equal(rendered.view, "main/onboarding-complete");
  assert.equal(rendered.locals.dashboardUrl, "/user/landlord/dashboard");
  assert.equal(rendered.locals.profileUrl, "/user/landlord/user-profile");
});

test("landlord verification requires a complete saved profile", () => {
  let redirectedTo = null;
  onboarding.landlord_verification_get(
    {
      user: {
        role: "landlord",
        fullName: "Incomplete Landlord",
      },
    },
    {
      redirect(path) {
        redirectedTo = path;
      },
    },
  );
  assert.equal(redirectedTo, "/onboarding-landlord");

  let rendered = null;
  const profile = completeProfile();
  onboarding.landlord_verification_get(
    {
      user: {
        role: "landlord",
        fullName: profile.legalName,
        landlordProfile: {
          ...profile,
          propertyCount: Number(profile.propertyCount),
        },
      },
    },
    {
      render(view, locals) {
        rendered = { view, locals };
      },
    },
  );
  assert.equal(rendered.view, "main/landlord-verification");
  assert.equal(rendered.locals.currentUser.role, "landlord");
});

test("renter verification requires a complete saved profile", () => {
  let redirectedTo = null;
  onboarding.renter_verification_get(
    {
      user: {
        role: "renter",
        fullName: "Incomplete Renter",
      },
    },
    {
      redirect(path) {
        redirectedTo = path;
      },
    },
  );
  assert.equal(redirectedTo, "/onboarding-tenant");

  let rendered = null;
  const profile = completeRenterProfile();
  onboarding.renter_verification_get(
    {
      user: {
        role: "renter",
        fullName: profile.legalName,
        renterProfile: {
          ...profile,
          monthlyBudget: Number(profile.monthlyBudget),
          moveInDate: new Date(`${profile.moveInDate}T00:00:00Z`),
        },
      },
    },
    {
      render(view, locals) {
        rendered = { view, locals };
      },
    },
  );
  assert.equal(rendered.view, "main/tenant-verification");
  assert.equal(rendered.locals.currentUser.role, "renter");
});
