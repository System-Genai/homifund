require("dotenv").config();
const path = require("path");
const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { attachUser } = require("./middleware/auth");
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

mongoose
  .connect(process.env.DB_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log(`HomiFund running on port ${process.env.PORT || 5000}`),
    ),
  )
  .catch((err) => console.log("DB connection error:", err));

mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

// Routes
app.use(mainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("main/404", { title: "404 | Page Not Found" });
});
