const LANDLORD_TYPES = new Set(["individual", "company", "partnership"]);
const PROPERTY_TYPES = new Set([
  "apartments",
  "houses",
  "hmos",
  "commercial",
]);
const MANAGEMENT_STYLES = new Set([
  "self-managed",
  "agency-managed",
  "hybrid",
]);
const PRIMARY_GOALS = new Set([
  "manage-properties",
  "review-applicants",
  "organize-rent",
]);
const HOUSEHOLD_SIZES = new Set(["one", "two", "three", "four-plus"]);
const PET_STATUSES = new Set(["none", "one", "multiple"]);
const EMPLOYMENT_STATUSES = new Set([
  "employed",
  "self-employed",
  "student",
  "retired",
  "other",
]);
const RENTER_PROPERTY_TYPES = new Set([
  "apartment",
  "house",
  "studio",
  "shared-home",
  "flexible",
]);

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeLandlordProfile(body = {}) {
  const submittedPropertyTypes = Array.isArray(body.propertyTypes)
    ? body.propertyTypes
    : body.propertyTypes
      ? [body.propertyTypes]
      : [];

  return {
    legalName: cleanText(body.legalName),
    landlordType: cleanText(body.landlordType),
    businessName: cleanText(body.businessName),
    propertyCount: cleanText(body.propertyCount),
    primaryLocations: cleanText(body.primaryLocations),
    propertyTypes: submittedPropertyTypes
      .map(cleanText)
      .filter((value) => PROPERTY_TYPES.has(value)),
    managementStyle: cleanText(body.managementStyle),
    primaryGoal: cleanText(body.primaryGoal),
  };
}

function validateLandlordProfile(form, { draft = false } = {}) {
  const errors = {};

  if (!draft && !form.legalName) {
    errors.legalName = "Enter the legal name used for this account.";
  } else if (form.legalName && form.legalName.length < 2) {
    errors.legalName = "Legal name must contain at least 2 characters.";
  } else if (form.legalName.length > 120) {
    errors.legalName = "Legal name must be 120 characters or fewer.";
  }

  if (!draft && !form.landlordType) {
    errors.landlordType = "Choose an account type.";
  } else if (form.landlordType && !LANDLORD_TYPES.has(form.landlordType)) {
    errors.landlordType = "Choose a supported account type.";
  }

  if (form.businessName.length > 120) {
    errors.businessName = "Business name must be 120 characters or fewer.";
  }

  const propertyCount = Number(form.propertyCount);
  if (!draft && form.propertyCount === "") {
    errors.propertyCount = "Enter the number of properties you manage.";
  } else if (
    form.propertyCount !== "" &&
    (!Number.isInteger(propertyCount) || propertyCount < 0 || propertyCount > 100000)
  ) {
    errors.propertyCount = "Enter a whole number from 0 to 100,000.";
  }

  if (!draft && !form.primaryLocations) {
    errors.primaryLocations = "Enter at least one operating location.";
  } else if (form.primaryLocations.length > 250) {
    errors.primaryLocations = "Locations must be 250 characters or fewer.";
  }

  if (!draft && form.propertyTypes.length === 0) {
    errors.propertyTypes = "Choose at least one property type.";
  }

  if (!draft && !form.managementStyle) {
    errors.managementStyle = "Choose a management style.";
  } else if (
    form.managementStyle &&
    !MANAGEMENT_STYLES.has(form.managementStyle)
  ) {
    errors.managementStyle = "Choose a supported management style.";
  }

  if (!draft && !form.primaryGoal) {
    errors.primaryGoal = "Choose the first task you want to focus on.";
  } else if (form.primaryGoal && !PRIMARY_GOALS.has(form.primaryGoal)) {
    errors.primaryGoal = "Choose a supported setup goal.";
  }

  return errors;
}

function landlordProfileToForm(user) {
  const profile = user.landlordProfile;

  return {
    legalName: profile?.legalName || user.fullName || "",
    landlordType: profile?.landlordType || "",
    businessName: profile?.businessName || "",
    propertyCount:
      profile?.propertyCount === 0 || profile?.propertyCount
        ? String(profile.propertyCount)
        : "",
    primaryLocations: profile?.primaryLocations || "",
    propertyTypes: profile?.propertyTypes || [],
    managementStyle: profile?.managementStyle || "",
    primaryGoal: profile?.primaryGoal || "",
  };
}

function renderLandlord(res, user, locals = {}, status = 200) {
  return res.status(status).render("main/onboarding-landlord", {
    title: "Landlord Onboarding | HomiFund",
    currentUser: user,
    form: landlordProfileToForm(user),
    fieldErrors: {},
    error: null,
    success: null,
    ...locals,
  });
}

exports.normalizeLandlordProfile = normalizeLandlordProfile;
exports.validateLandlordProfile = validateLandlordProfile;

exports.landlord_get = (req, res) => {
  return renderLandlord(res, req.user, {
    success:
      req.query.saved === "1"
        ? "Draft saved. You can continue now or return later."
        : null,
  });
};

function normalizeRenterProfile(body = {}) {
  return {
    legalName: cleanText(body.legalName),
    phone: cleanText(body.phone),
    householdSize: cleanText(body.householdSize),
    petStatus: cleanText(body.petStatus),
    employmentStatus: cleanText(body.employmentStatus),
    jobTitle: cleanText(body.jobTitle),
    employer: cleanText(body.employer),
    monthlyBudget: cleanText(body.monthlyBudget),
    preferredLocations: cleanText(body.preferredLocations),
    propertyType: cleanText(body.propertyType),
    moveInDate: cleanText(body.moveInDate),
  };
}

function validateRenterProfile(form, { draft = false } = {}) {
  const errors = {};

  if (!draft && !form.legalName) {
    errors.legalName = "Enter the legal name used for this account.";
  } else if (form.legalName && form.legalName.length < 2) {
    errors.legalName = "Legal name must contain at least 2 characters.";
  } else if (form.legalName.length > 120) {
    errors.legalName = "Legal name must be 120 characters or fewer.";
  }

  if (form.phone) {
    const digits = form.phone.replace(/\D/g, "");
    if (form.phone.length > 30 || digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number with 7 to 15 digits.";
    }
  }

  if (!draft && !form.householdSize) {
    errors.householdSize = "Choose a household size.";
  } else if (form.householdSize && !HOUSEHOLD_SIZES.has(form.householdSize)) {
    errors.householdSize = "Choose a supported household size.";
  }

  if (!draft && !form.petStatus) {
    errors.petStatus = "Choose a pet status.";
  } else if (form.petStatus && !PET_STATUSES.has(form.petStatus)) {
    errors.petStatus = "Choose a supported pet status.";
  }

  if (!draft && !form.employmentStatus) {
    errors.employmentStatus = "Choose your current employment status.";
  } else if (
    form.employmentStatus &&
    !EMPLOYMENT_STATUSES.has(form.employmentStatus)
  ) {
    errors.employmentStatus = "Choose a supported employment status.";
  }

  if (form.jobTitle.length > 120) {
    errors.jobTitle = "Job title must be 120 characters or fewer.";
  }

  if (form.employer.length > 120) {
    errors.employer = "Employer must be 120 characters or fewer.";
  }

  const monthlyBudget = Number(form.monthlyBudget);
  if (!draft && form.monthlyBudget === "") {
    errors.monthlyBudget = "Enter your maximum monthly budget.";
  } else if (
    form.monthlyBudget !== "" &&
    (!Number.isFinite(monthlyBudget) || monthlyBudget < 0 || monthlyBudget > 1000000)
  ) {
    errors.monthlyBudget = "Enter an amount from 0 to 1,000,000.";
  }

  if (!draft && !form.preferredLocations) {
    errors.preferredLocations = "Enter at least one preferred location.";
  } else if (form.preferredLocations.length > 250) {
    errors.preferredLocations = "Locations must be 250 characters or fewer.";
  }

  if (!draft && !form.propertyType) {
    errors.propertyType = "Choose a property type.";
  } else if (form.propertyType && !RENTER_PROPERTY_TYPES.has(form.propertyType)) {
    errors.propertyType = "Choose a supported property type.";
  }

  if (
    form.moveInDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(form.moveInDate) ||
      Number.isNaN(Date.parse(`${form.moveInDate}T00:00:00Z`)))
  ) {
    errors.moveInDate = "Enter a valid move-in date.";
  }

  return errors;
}

function renterProfileToForm(user) {
  const profile = user.renterProfile;

  return {
    legalName: profile?.legalName || user.fullName || "",
    phone: profile?.phone || "",
    householdSize: profile?.householdSize || "",
    petStatus: profile?.petStatus || "",
    employmentStatus: profile?.employmentStatus || "",
    jobTitle: profile?.jobTitle || "",
    employer: profile?.employer || "",
    monthlyBudget:
      profile?.monthlyBudget === 0 || profile?.monthlyBudget
        ? String(profile.monthlyBudget)
        : "",
    preferredLocations: profile?.preferredLocations || "",
    propertyType: profile?.propertyType || "",
    moveInDate: profile?.moveInDate
      ? new Date(profile.moveInDate).toISOString().slice(0, 10)
      : "",
  };
}

function renderRenter(res, user, locals = {}, status = 200) {
  return res.status(status).render("main/onboarding-tenant", {
    title: "Renter Onboarding | HomiFund",
    currentUser: user,
    form: renterProfileToForm(user),
    fieldErrors: {},
    error: null,
    success: null,
    ...locals,
  });
}

exports.normalizeRenterProfile = normalizeRenterProfile;
exports.validateRenterProfile = validateRenterProfile;

exports.renter_get = (req, res) => {
  return renderRenter(res, req.user, {
    success:
      req.query.saved === "1"
        ? "Draft saved. You can continue now or return later."
        : null,
  });
};

exports.renter_post = async (req, res) => {
  const form = normalizeRenterProfile(req.body);
  const isDraft = req.body?.intent === "draft";
  const fieldErrors = validateRenterProfile(form, { draft: isDraft });

  if (Object.keys(fieldErrors).length) {
    return renderRenter(
      res,
      req.user,
      {
        form,
        fieldErrors,
        error: "Review the highlighted fields and try again.",
      },
      400,
    );
  }

  try {
    req.user.renterProfile = {
      legalName: form.legalName || undefined,
      phone: form.phone || undefined,
      householdSize: form.householdSize || undefined,
      petStatus: form.petStatus || undefined,
      employmentStatus: form.employmentStatus || undefined,
      jobTitle: form.jobTitle || undefined,
      employer: form.employer || undefined,
      monthlyBudget:
        form.monthlyBudget === "" ? undefined : Number(form.monthlyBudget),
      preferredLocations: form.preferredLocations || undefined,
      propertyType: form.propertyType || undefined,
      moveInDate: form.moveInDate
        ? new Date(`${form.moveInDate}T00:00:00Z`)
        : undefined,
      updatedAt: new Date(),
    };
    await req.user.save();

    return res.redirect(
      isDraft ? "/onboarding-tenant?saved=1" : "/tenant-verification",
    );
  } catch (error) {
    console.error("Renter onboarding error:", error);
    return renderRenter(
      res,
      req.user,
      {
        form,
        fieldErrors: {},
        error: "Your profile could not be saved. Please try again.",
      },
      500,
    );
  }
};

exports.complete_get = (req, res) => {
  const isLandlord = req.user.role === "landlord";
  const form = isLandlord
    ? landlordProfileToForm(req.user)
    : renterProfileToForm(req.user);
  const fieldErrors = isLandlord
    ? validateLandlordProfile(form)
    : validateRenterProfile(form);

  if (Object.keys(fieldErrors).length) {
    return res.redirect(
      isLandlord ? "/onboarding-landlord" : "/onboarding-tenant",
    );
  }

  return res.render("main/onboarding-complete", {
    title: "Profile Setup Complete | HomiFund",
    currentUser: req.user,
    role: req.user.role,
    dashboardUrl: `/user/${req.user.role}/dashboard`,
    profileUrl: isLandlord
      ? "/user/landlord/user-profile"
      : "/user/renter/profile",
  });
};

exports.landlord_verification_get = (req, res) => {
  const fieldErrors = validateLandlordProfile(landlordProfileToForm(req.user));

  if (Object.keys(fieldErrors).length) {
    return res.redirect("/onboarding-landlord");
  }

  return res.render("main/landlord-verification", {
    title: "Landlord Verification | HomiFund",
    currentUser: req.user,
  });
};

exports.renter_verification_get = (req, res) => {
  const fieldErrors = validateRenterProfile(renterProfileToForm(req.user));

  if (Object.keys(fieldErrors).length) {
    return res.redirect("/onboarding-tenant");
  }

  return res.render("main/tenant-verification", {
    title: "Renter Verification | HomiFund",
    currentUser: req.user,
  });
};

exports.landlord_post = async (req, res) => {
  const form = normalizeLandlordProfile(req.body);
  const isDraft = req.body?.intent === "draft";
  const fieldErrors = validateLandlordProfile(form, { draft: isDraft });

  if (Object.keys(fieldErrors).length) {
    return renderLandlord(
      res,
      req.user,
      {
        form,
        fieldErrors,
        error: "Review the highlighted fields and try again.",
      },
      400,
    );
  }

  try {
    req.user.landlordProfile = {
      legalName: form.legalName || undefined,
      landlordType: form.landlordType || undefined,
      businessName: form.businessName || undefined,
      propertyCount:
        form.propertyCount === "" ? undefined : Number(form.propertyCount),
      primaryLocations: form.primaryLocations || undefined,
      propertyTypes: form.propertyTypes,
      managementStyle: form.managementStyle || undefined,
      primaryGoal: form.primaryGoal || undefined,
      updatedAt: new Date(),
    };
    await req.user.save();

    return res.redirect(
      isDraft ? "/onboarding-landlord?saved=1" : "/landlord-verification",
    );
  } catch (error) {
    console.error("Landlord onboarding error:", error);
    return renderLandlord(
      res,
      req.user,
      {
        form,
        fieldErrors: {},
        error: "Your profile could not be saved. Please try again.",
      },
      500,
    );
  }
};
