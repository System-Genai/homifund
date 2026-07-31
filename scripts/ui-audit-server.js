const path = require("path");
const express = require("express");

const app = express();
const projectRoot = path.resolve(__dirname, "..");
const port = Number(process.env.UI_AUDIT_PORT || 5055);

app.set("view engine", "ejs");
app.set("views", path.join(projectRoot, "views"));
app.use(express.static(path.join(projectRoot, "public")));

app.get("/audit", (req, res, next) => {
  const view = String(req.query.view || "");

  if (!/^[A-Za-z0-9_/-]+$/.test(view) || view.includes("..")) {
    return res.status(400).send("Invalid view");
  }

  const role = String(req.query.role || "renter");
  const isLandlordOnboarding = view === "main/onboarding-landlord";
  const isRenterOnboarding = view === "main/onboarding-tenant";
  const isResetPassword = view === "main/reset-password";
  const isOnboardingComplete = view === "main/onboarding-complete";
  const isLandlordVerification = view === "main/landlord-verification";
  const isRenterVerification = view === "main/tenant-verification";
  const isRenterWorkspace = view.startsWith("user/renter/");
  const isAdminWorkspace = view.startsWith("admin/");
  const state = String(req.query.state || "");
  const landlordForm = {
    legalName: state === "error" ? "A" : "",
    landlordType: "",
    businessName: "",
    propertyCount: state === "error" ? "-1" : "",
    primaryLocations: "",
    propertyTypes: [],
    managementStyle: "",
    primaryGoal: "",
  };
  const renterForm = {
    legalName: state === "error" ? "A" : "",
    phone: state === "error" ? "12" : "",
    householdSize: "",
    petStatus: "",
    employmentStatus: "",
    jobTitle: "",
    employer: "",
    monthlyBudget: state === "error" ? "-1" : "",
    preferredLocations: "",
    propertyType: "",
    moveInDate: "",
  };

  res.render(
    view,
    {
      title: "Responsive Audit",
      currentPage: String(req.query.currentPage || "dashboard"),
      role,
      userRole: role,
      currentUser: {
        fullName: isAdminWorkspace
          ? "Audit Administrator"
          : isRenterWorkspace
            ? "Audit Renter"
            : "Audit Landlord",
        email: "audit@example.com",
        role: isLandlordOnboarding
          ? "landlord"
          : isRenterOnboarding || isOnboardingComplete || isLandlordVerification || isRenterVerification
            ? role
            : null,
      },
      requestedUrl: "/audit",
      returnTo: null,
      notice: null,
      error: state === "error" ? "Review the highlighted fields and try again." : null,
      success:
        state === "success"
            ? isLandlordOnboarding || isRenterOnboarding
              ? "Draft saved. You can continue now or return later."
            : "Your password has been updated. You can now sign in."
          : null,
      email: "",
      form: isLandlordOnboarding
        ? landlordForm
        : isRenterOnboarding
          ? renterForm
          : {},
      fieldErrors:
        state !== "error"
          ? {}
          : isLandlordOnboarding
            ? {
                legalName: "Legal name must contain at least 2 characters.",
                propertyCount: "Enter a whole number from 0 to 100,000.",
                primaryLocations: "Enter at least one operating location.",
                propertyTypes: "Choose at least one property type.",
                managementStyle: "Choose a management style.",
                primaryGoal: "Choose the first task you want to focus on.",
              }
            : isRenterOnboarding
              ? {
                  legalName: "Legal name must contain at least 2 characters.",
                  phone: "Enter a valid phone number with 7 to 15 digits.",
                  householdSize: "Choose a household size.",
                  petStatus: "Choose a pet status.",
                  employmentStatus: "Choose your current employment status.",
                  monthlyBudget: "Enter an amount from 0 to 1,000,000.",
                  preferredLocations: "Enter at least one preferred location.",
                  propertyType: "Choose a property type.",
                }
              : isResetPassword
              ? {
                  password: "Use at least 8 characters.",
                  passwordConfirmation: "Passwords must match.",
                }
              : {},
      token: "audit-token",
      invalid: req.query.state === "invalid",
      selectedRole:
        req.query.selected === "renter" || req.query.selected === "landlord"
          ? req.query.selected
          : null,
      dashboardUrl: `/user/${role}/dashboard`,
      recoveryUrl:
        role === "admin" ? "/admin/management" : `/user/${role}/dashboard`,
      recoveryLabel: "Return to your workspace",
      profileUrl:
        role === "landlord"
          ? "/user/landlord/user-profile"
          : "/user/renter/profile",
      profile: {
        landlordType: "individual",
        propertyCount: 3,
        primaryLocations: "Manchester",
        managementStyle: "self-managed",
      },
      renterProfile: {
        legalName: "Audit Renter",
        phone: "+44 7700 900123",
        householdSize: "two",
        petStatus: "none",
        employmentStatus: "employed",
        jobTitle: "Designer",
        employer: "Example Studio",
        monthlyBudget: 1800,
        preferredLocations: "Manchester city centre",
        propertyType: "apartment",
      },
    },
    (error, html) => (error ? next(error) : res.send(html)),
  );
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(500).send(error.message);
});

app.listen(port, "127.0.0.1", () => {
  console.log(`UI audit renderer listening on http://127.0.0.1:${port}`);
});
