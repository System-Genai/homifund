const router = require("express").Router();
const auth = require("../controllers/auth");
const {
  requireAuth,
  requireRole,
  redirectIfAuth,
} = require("../middleware/auth");

// ==================== PUBLIC PAGES ====================
router.get("/", (req, res) =>
  res.render("main/index", {
    title: "HomiFund | The Complete Rental Ecosystem for Trusted Relationships",
  }),
);
router.get("/about", (req, res) =>
  res.render("main/about", { title: "About Us | HomiFund" }),
);
router.get("/contact", (req, res) =>
  res.render("main/contact", { title: "Contact | HomiFund" }),
);
router.get("/faqs", (req, res) =>
  res.render("main/FAQs", { title: "FAQs | HomiFund" }),
);
router.get("/pricing", (req, res) =>
  res.render("main/pricing", { title: "Pricing | HomiFund" }),
);
router.get("/renters", (req, res) =>
  res.render("main/renters", { title: "For Renters | HomiFund" }),
);
router.get("/landlords", (req, res) =>
  res.render("main/landlords", { title: "For Landlords | HomiFund" }),
);

// ==================== AUTH ROUTES ====================
router.get("/signup", redirectIfAuth, auth.signup_get);
router.post("/signup", redirectIfAuth, auth.signup_post);
router.get("/login", redirectIfAuth, auth.login_get);
router.post("/login", redirectIfAuth, auth.login_post);
router.get("/logout", auth.logout);
router.get("/forget-password", (req, res) =>
  res.render("main/forget-password", { title: "Forgot Password | HomiFund" }),
);

// Role selection (protected: must be logged in, no role yet)
router.get("/role-selection", requireAuth, auth.role_selection_get);
router.post("/role-selection", requireAuth, auth.role_selection_post);

// ==================== ONBOARDING ====================
router.get("/onboarding-landlord", requireAuth, (req, res) =>
  res.render("main/onboarding-landlord", {
    title: "Landlord Onboarding | HomiFund",
  }),
);
router.get("/onboarding-tenant", requireAuth, (req, res) =>
  res.render("main/onboarding-tenant", {
    title: "Tenant Onboarding | HomiFund",
  }),
);
router.get("/onboarding-complete", requireAuth, (req, res) =>
  res.render("main/onboarding-complete", {
    title: "Onboarding Complete | HomiFund",
  }),
);

// ==================== VERIFICATION ====================
router.get("/landlord-verification", requireAuth, (req, res) =>
  res.render("main/landlord-verification", {
    title: "Landlord Verification | HomiFund",
  }),
);
router.get("/tenant-verification", requireAuth, (req, res) =>
  res.render("main/tenant-verification", {
    title: "Tenant Verification | HomiFund",
  }),
);

// ==================== LANDLORD DASHBOARD ====================
router.get(
  "/user/landlord/dashboard",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/dashboard", {
      title: "Dashboard | Landlord",
      currentPage: "dashboard",
    }),
);
router.get(
  "/user/landlord/homiscore",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/HomiScore", {
      title: "HomiScore | Landlord",
      currentPage: "homiscore",
    }),
);
router.get(
  "/user/landlord/properties",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/properties", {
      title: "Properties | Landlord",
      currentPage: "properties",
    }),
);
router.get(
  "/user/landlord/applicants",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/applicants", {
      title: "Applicants | Landlord",
      currentPage: "applicants",
    }),
);
router.get(
  "/user/landlord/documents",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/documents", {
      title: "Documents | Landlord",
      currentPage: "documents",
    }),
);
router.get(
  "/user/landlord/payments",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/payments", {
      title: "Payments | Landlord",
      currentPage: "payments",
    }),
);
router.get(
  "/user/landlord/messages",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/messages", { title: "Messages | Landlord" }),
);
router.get(
  "/user/landlord/notification-bell",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/notification-bell", {
      title: "Notifications | Landlord",
    }),
);
router.get(
  "/user/landlord/settings",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/settings", { title: "Settings | Landlord" }),
);
router.get(
  "/user/landlord/support",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/support", { title: "Support | Landlord" }),
);
router.get(
  "/user/landlord/user-profile",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/user-profile", { title: "Profile | Landlord" }),
);
router.get(
  "/user/landlord/view-profile",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/view-profile", {
      title: "View Profile | Landlord",
    }),
);
router.get(
  "/user/landlord/view-calendar",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/view-calendar", { title: "Calendar | Landlord" }),
);
router.get(
  "/user/landlord/review-application",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/review-application", {
      title: "Review Application | Landlord",
    }),
);

// Add Property wizard
router.get(
  "/user/landlord/properties/add/address",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/Add-Properties/address-and-type", {
      title: "Add Property | Landlord",
    }),
);
router.get(
  "/user/landlord/properties/add/listing-details",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/Add-Properties/listing-details", {
      title: "Add Property Details | Landlord",
    }),
);
router.get(
  "/user/landlord/properties/add/photos",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/Add-Properties/photos-and-documents", {
      title: "Add Property Photos | Landlord",
    }),
);
router.get(
  "/user/landlord/properties/add/rent",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/Add-Properties/rent-and-availabilty", {
      title: "Add Property Rent | Landlord",
    }),
);
router.get(
  "/user/landlord/properties/add/review",
  requireAuth,
  requireRole("landlord"),
  (req, res) =>
    res.render("user/landlord/Add-Properties/review-and-publish", {
      title: "Review Property | Landlord",
    }),
);

// ==================== RENTER DASHBOARD ====================
router.get(
  "/user/renter/dashboard",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/dashboard", {
      title: "Dashboard | Renter",
      currentPage: "dashboard",
    }),
);
router.get(
  "/user/renter/homiscore",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/HomiScore", {
      title: "HomiScore | Renter",
      currentPage: "homiscore",
    }),
);
router.get(
  "/user/renter/applications",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/applications", {
      title: "Applications | Renter",
      currentPage: "applications",
    }),
);
router.get(
  "/user/renter/documents",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/documents", {
      title: "Documents | Renter",
      currentPage: "documents",
    }),
);
router.get(
  "/user/renter/payments",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/Payments", {
      title: "Payments | Renter",
      currentPage: "payments",
    }),
);
router.get(
  "/user/renter/messages",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/messages", { title: "Messages | Renter" }),
);
router.get(
  "/user/renter/notification-bell",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/notification-bell", {
      title: "Notifications | Renter",
    }),
);
router.get(
  "/user/renter/profile",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/profile", { title: "Profile | Renter" }),
);
router.get(
  "/user/renter/settings",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/settings", { title: "Settings | Renter" }),
);
router.get(
  "/user/renter/support",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/support", { title: "Support | Renter" }),
);
router.get(
  "/user/renter/view-detail",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/view-detail", { title: "View Details | Renter" }),
);
router.get(
  "/user/renter/view-property",
  requireAuth,
  requireRole("renter"),
  (req, res) =>
    res.render("user/renter/View-property", {
      title: "View Property | Renter",
    }),
);

// ==================== ADMIN DASHBOARD ====================
router.get("/admin/management", requireAuth, requireRole("admin"), (req, res) =>
  res.render("admin/management", {
    title: "Management | Admin",
    currentPage: "management",
  }),
);
router.get(
  "/admin/verification-review",
  requireAuth,
  requireRole("admin"),
  (req, res) =>
    res.render("admin/verification-review", {
      title: "Verification Review | Admin",
      currentPage: "verification-review",
    }),
);

module.exports = router;
