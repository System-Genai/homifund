const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "homifund-dev-secret-change-in-production";
const JWT_EXPIRES = "7d";

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Middleware: attach user to req if token is valid
async function attachUser(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const User = require("../models/User");
    req.user = await User.findById(decoded.id).select("-password");
  } catch (_) {
    res.clearCookie("token");
  }
  next();
}

// Middleware: require authentication
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
}

// Middleware: require specific role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) {
      return res.status(403).render("main/404", { title: "403 | Forbidden" });
    }
    next();
  };
}

// Redirect authenticated users away from login/signup
function redirectIfAuth(req, res, next) {
  if (req.user && req.user.role) {
    return res.redirect(`/user/${req.user.role}/dashboard`);
  }
  if (req.user && !req.user.role) {
    return res.redirect("/role-selection");
  }
  next();
}

module.exports = {
  signToken,
  setAuthCookie,
  attachUser,
  requireAuth,
  requireRole,
  redirectIfAuth,
};
