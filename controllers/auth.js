const crypto = require("crypto");
const User = require("../models/User");
const { signToken, setAuthCookie, getRoleHome } = require("../middleware/auth");
const { isMailerConfigured, sendMail } = require("../utils/mailer");

function validateSignupForm({ full_name: fullName, email, password }) {
  const errors = {};

  if (!fullName) {
    errors.full_name = "Enter your full name.";
  } else if (fullName.length < 2) {
    errors.full_name = "Name must contain at least 2 characters.";
  } else if (fullName.length > 120) {
    errors.full_name = "Name must be 120 characters or fewer.";
  }

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Create a password.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or fewer.";
  }

  return errors;
}

exports.validateSignupForm = validateSignupForm;

function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or fewer.";
  }

  return errors;
}

exports.validateLoginForm = validateLoginForm;

function validateResetRequestEmail(email) {
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

exports.validateResetRequestEmail = validateResetRequestEmail;

function validateResetPassword(password, confirmation) {
  const errors = {};

  if (!password) {
    errors.password = "Enter a new password.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or fewer.";
  }

  if (!confirmation) {
    errors.passwordConfirmation = "Confirm your new password.";
  } else if (password !== confirmation) {
    errors.passwordConfirmation = "Passwords must match.";
  }

  return errors;
}

exports.validateResetPassword = validateResetPassword;

function validateRoleSelection(role) {
  return ["renter", "landlord"].includes(role)
    ? null
    : "Choose either the renter or landlord workspace.";
}

exports.validateRoleSelection = validateRoleSelection;

// GET /signup
exports.signup_get = (req, res) => {
  res.render("main/signup", {
    title: "Sign Up | HomiFund",
    error: null,
    form: {},
    fieldErrors: {},
  });
};

// POST /signup
exports.signup_post = async (req, res) => {
  const form = {
    full_name: String(req.body.full_name || req.body.fullName || "").trim(),
    email: String(req.body.email || "").trim().toLowerCase(),
  };
  const password = String(req.body.password || "");
  const fieldErrors = validateSignupForm({ ...form, password });

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render("main/signup", {
      title: "Sign Up | HomiFund",
      error: "Review the highlighted fields and try again.",
      form,
      fieldErrors,
    });
  }

  try {
    const exists = await User.findOne({ email: form.email });
    if (exists) {
      return res.status(409).render("main/signup", {
        title: "Sign Up | HomiFund",
        error: "An account with this email already exists.",
        form,
        fieldErrors: {
          email: "Use a different email address or sign in instead.",
        },
      });
    }

    const user = await User.create({
      fullName: form.full_name,
      email: form.email,
      password,
    });
    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.redirect("/role-selection");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).render("main/signup", {
      title: "Sign Up | HomiFund",
      error: "Something went wrong. Please try again.",
      form,
      fieldErrors: {},
    });
  }
};

// GET /login
exports.login_get = (req, res) => {
  res.render("main/login", {
    title: "Sign In | HomiFund",
    notice:
      req.query.reason === "session"
        ? "Please sign in to continue to that page."
        : null,
    returnTo: safeReturnPath(req.query.returnTo),
    form: {},
    fieldErrors: {},
    error: null,
  });
};

// POST /login
exports.login_post = async (req, res) => {
  const form = {
    email: String(req.body.email || "").trim().toLowerCase(),
  };
  const password = String(req.body.password || "");
  const returnTo = safeReturnPath(req.body.returnTo);
  const fieldErrors = validateLoginForm({ ...form, password });

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render("main/login", {
      title: "Sign In | HomiFund",
      error: "Review the highlighted fields and try again.",
      notice: null,
      returnTo,
      form,
      fieldErrors,
    });
  }

  try {
    const user = await User.findOne({ email: form.email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render("main/login", {
        title: "Sign In | HomiFund",
        error: "Invalid email or password.",
        notice: null,
        returnTo,
        form,
        fieldErrors: {},
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    if (returnTo) {
      return res.redirect(returnTo);
    }

    if (user.role) {
      return res.redirect(getRoleHome(user.role));
    }
    res.redirect("/role-selection");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("main/login", {
      title: "Sign In | HomiFund",
      error: "Something went wrong. Please try again.",
      notice: null,
      returnTo,
      form,
      fieldErrors: {},
    });
  }
};

// GET /role-selection
exports.role_selection_get = (req, res) => {
  if (req.user.role) {
    return res.redirect(getRoleHome(req.user.role));
  }

  res.render("main/role-selection", {
    title: "Choose Your Workspace | HomiFund",
    currentUser: req.user,
    error: null,
    selectedRole: null,
  });
};

// POST /role-selection
exports.role_selection_post = async (req, res) => {
  if (req.user.role) {
    return res.redirect(getRoleHome(req.user.role));
  }

  const role = String(req.body?.role || "").trim().toLowerCase();
  const error = validateRoleSelection(role);

  if (error) {
    return res.status(400).render("main/role-selection", {
      title: "Choose Your Workspace | HomiFund",
      currentUser: req.user,
      error,
      selectedRole: null,
    });
  }

  try {
    req.user.role = role;
    await req.user.save();

    res.redirect(
      role === "landlord" ? "/onboarding-landlord" : "/onboarding-tenant",
    );
  } catch (err) {
    console.error("Role selection error:", err);
    req.user.role = null;
    res.status(500).render("main/role-selection", {
      title: "Choose Your Workspace | HomiFund",
      currentUser: req.user,
      error: "Something went wrong. Please try again.",
      selectedRole: role,
    });
  }
};

exports.forget_password_get = (req, res) => {
  res.render("main/forget-password", {
    title: "Forgot Password | HomiFund",
    error: null,
    success: null,
    email: "",
    fieldErrors: {},
  });
};

exports.forget_password_post = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  const emailError = validateResetRequestEmail(email);

  if (emailError) {
    return res.status(400).render("main/forget-password", {
      title: "Forgot Password | HomiFund",
      error: "Review the highlighted field and try again.",
      success: null,
      email,
      fieldErrors: { email: emailError },
    });
  }

  if (!isMailerConfigured()) {
    return res.status(503).render("main/forget-password", {
      title: "Forgot Password | HomiFund",
      error:
        "Password reset email is not configured yet. Contact support@homifund.com for help.",
      success: null,
      email,
      fieldErrors: {},
    });
  }

  try {
    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpires",
    );

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const baseUrl =
        process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;

      try {
        await sendMail({
          to: user.email,
          subject: "Reset your HomiFund password",
          text: `Use this link within one hour to reset your password: ${baseUrl}/reset-password/${token}`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw error;
      }
    }

    return res.render("main/forget-password", {
      title: "Forgot Password | HomiFund",
      error: null,
      success:
        "If an account matches that email, a reset link will arrive shortly.",
      email: "",
      fieldErrors: {},
    });
  } catch (error) {
    console.error("Password reset request error:", error.message);
    return res.status(502).render("main/forget-password", {
      title: "Forgot Password | HomiFund",
      error: "We could not send a reset email. Try again or contact support.",
      success: null,
      email,
      fieldErrors: {},
    });
  }
};

exports.reset_password_get = async (req, res) => {
  const tokenHash = hashResetToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("_id");

  res.status(user ? 200 : 400).render("main/reset-password", {
    title: "Reset Password | HomiFund",
    token: req.params.token,
    invalid: !user,
    error: null,
    success: null,
    fieldErrors: {},
  });
};

exports.reset_password_post = async (req, res) => {
  const password = String(req.body.password || "");
  const confirmation = String(req.body.passwordConfirmation || "");
  const renderData = {
    title: "Reset Password | HomiFund",
    token: req.params.token,
    invalid: false,
    error: null,
    success: null,
    fieldErrors: {},
  };

  const fieldErrors = validateResetPassword(password, confirmation);

  if (Object.keys(fieldErrors).length) {
    return res.status(400).render("main/reset-password", {
      ...renderData,
      error: "Review the highlighted fields and try again.",
      fieldErrors,
    });
  }

  const user = await User.findOne({
    resetPasswordToken: hashResetToken(req.params.token),
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(400).render("main/reset-password", {
      ...renderData,
      invalid: true,
      fieldErrors: {},
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.render("main/reset-password", {
    ...renderData,
    success: "Your password has been updated. You can now sign in.",
    fieldErrors: {},
  });
};

// GET /logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};

function safeReturnPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}
