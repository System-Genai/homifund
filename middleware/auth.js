const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "homifund-dev-secret-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRE || "7d";
const DEFAULT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieMaxAge(environment = process.env) {
  const configuredValue =
    environment.COOKIE_MAX_AGE_MS ?? environment.MAX_AGE;
  const milliseconds = Number(configuredValue);

  return Number.isSafeInteger(milliseconds) && milliseconds > 0
    ? milliseconds
    : DEFAULT_COOKIE_MAX_AGE_MS;
}

const COOKIE_MAX_AGE = getCookieMaxAge();

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

// Middleware: attach user to req if token is valid
async function attachUser(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();

  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (_) {
    res.clearCookie("token");
    return next();
  }

  try {
    const User = require("../models/User");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.clearCookie("token");
      return next();
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

// Middleware: require authentication
function requireAuth(req, res, next) {
  if (!req.user) {
    const returnTo = encodeURIComponent(req.originalUrl || "/");
    return res.redirect(`/login?reason=session&returnTo=${returnTo}`);
  }
  next();
}

// Middleware: require specific role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) {
      return res.status(403).render("main/403", {
        title: "Access Denied | HomiFund",
        requestedUrl: req.originalUrl,
        userRole: req.user.role,
        currentUser: req.user,
        dashboardUrl: getRoleHome(req.user.role),
      });
    }
    next();
  };
}

// Redirect authenticated users away from login/signup
function redirectIfAuth(req, res, next) {
  if (req.user && req.user.role) {
    return res.redirect(getRoleHome(req.user.role));
  }
  if (req.user && !req.user.role) {
    return res.redirect("/role-selection");
  }
  next();
}

function getRoleHome(role) {
  if (role === "admin") {
    return "/admin/management";
  }

  if (role === "landlord" || role === "renter") {
    return `/user/${role}/dashboard`;
  }

  return "/role-selection";
}

module.exports = {
  signToken,
  setAuthCookie,
  getCookieMaxAge,
  attachUser,
  requireAuth,
  requireRole,
  redirectIfAuth,
  getRoleHome,
};
