require("dotenv").config();
const path = require("path");
const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { attachUser, getRoleHome } = require("./middleware/auth");
const mainRoutes = require("./routes/mainRoutes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

// Lowercase all incoming URLs so mixed-case client-side navigations work
app.use((req, res, next) => {
  const lower = req.path.toLowerCase();
  if (lower !== req.path) {
    return res.redirect(301, lower + (req.url.slice(req.path.length) || ""));
  }
  next();
});

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(attachUser);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

mongoose
  .connect(process.env.DB_URI)
  .catch((err) => console.error("DB connection error:", err.message));

// Routes
app.use(mainRoutes);

app.get("/health", (req, res) => {
  const databaseStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const database = databaseStates[mongoose.connection.readyState] || "unknown";
  res.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "degraded",
    database,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled request error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).render("main/500", {
    title: "Something Went Wrong | HomiFund",
    currentUser: req.user,
    requestedUrl: req.originalUrl,
    recoveryUrl: req.user ? getRoleHome(req.user.role) : "/",
    recoveryLabel: req.user ? "Return to your workspace" : "Back to home",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("main/404", {
    title: "404 | Page Not Found",
    currentUser: req.user,
    requestedUrl: req.originalUrl,
    recoveryUrl: req.user ? getRoleHome(req.user.role) : "/",
    recoveryLabel: req.user ? "Return to your workspace" : "Back to home",
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`HomiFund running on port ${port}`));
