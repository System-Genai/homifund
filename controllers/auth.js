const User = require("../models/User");
const { signToken, setAuthCookie } = require("../middleware/auth");

// GET /signup
exports.signup_get = (req, res) => {
  res.render("main/signup", { title: "Sign Up | HomiFund" });
};

// POST /signup
exports.signup_post = async (req, res) => {
  try {
    const fullName = req.body.full_name || req.body.fullName;
    const { email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.render("main/signup", {
        title: "Sign Up | HomiFund",
        error: "All fields are required.",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.render("main/signup", {
        title: "Sign Up | HomiFund",
        error: "An account with this email already exists.",
      });
    }

    const user = await User.create({ fullName, email, password });
    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.redirect("/role-selection");
  } catch (err) {
    console.error("Signup error:", err);
    res.render("main/signup", {
      title: "Sign Up | HomiFund",
      error: "Something went wrong. Please try again.",
    });
  }
};

// GET /login
exports.login_get = (req, res) => {
  res.render("main/login", { title: "Sign In | HomiFund" });
};

// POST /login
exports.login_post = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("main/login", {
        title: "Sign In | HomiFund",
        error: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("main/login", {
        title: "Sign In | HomiFund",
        error: "Invalid email or password.",
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    if (user.role) {
      return res.redirect(`/user/${user.role}/dashboard`);
    }
    res.redirect("/role-selection");
  } catch (err) {
    console.error("Login error:", err);
    res.render("main/login", {
      title: "Sign In | HomiFund",
      error: "Something went wrong. Please try again.",
    });
  }
};

// GET /role-selection
exports.role_selection_get = (req, res) => {
  res.render("main/role-selection", { title: "Choose Your Role | HomiFund" });
};

// POST /role-selection
exports.role_selection_post = async (req, res) => {
  try {
    const role = req.body?.role;
    if (!role || !["renter", "landlord"].includes(role)) {
      return res.render("main/role-selection", {
        title: "Choose Your Role | HomiFund",
        error: "Please select a valid role.",
      });
    }

    req.user.role = role;
    await req.user.save();

    res.redirect(`/user/${role}/dashboard`);
  } catch (err) {
    console.error("Role selection error:", err);
    res.render("main/role-selection", {
      title: "Choose Your Role | HomiFund",
      error: "Something went wrong. Please try again.",
    });
  }
};

// GET /logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
