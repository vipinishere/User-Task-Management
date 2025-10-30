require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const expressEjsLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const connectDB = require("./config/db");

// Connect to Database
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express App
const app = express();

// view engine setup
app.set("view engine", "ejs");
app.use(expressEjsLayouts);

// Middleware
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom Middleware to track previous and current paths
app.use((req, res, next) => {
  res.cookie("previousPath", req.cookies.currentPath || "");
  res.cookie("currentPath", req.originalUrl);
  next();
});

const {
  getCeoLoginHandler,
  ceoLoginHandler,
} = require("./controllers/ceoController");
const {
  getLoginPageHandler,
  postLoginPageHandler,
} = require("./controllers/adminController");
const {
  getUserLoginHandler,
  postUserLoginHandler,
  getUserRegisterHandler,
  postUserRegisterHandler,
} = require("./controllers/userController");

// Home Route
app.use("/", require("./routes/homeRoutes"));

// CEO Routes
app.get("/ceo/login", getCeoLoginHandler);
app.post("/ceo/login", ceoLoginHandler);
app.use("/ceo", require("./routes/ceoRoutes"));

// Admin Routes
app.get("/admin/login", getLoginPageHandler);
app.post("/admin/login", postLoginPageHandler);
app.use("/admin", require("./routes/adminRoutes"));

// User Routes
app.get("/user/register", getUserRegisterHandler);
app.post("/user/register", postUserRegisterHandler);
app.get("/user/login", getUserLoginHandler);
app.post("/user/login", postUserLoginHandler);
app.use("/user", require("./routes/userRoutes"));

// Global Error
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (req.originalUrl.startsWith("/api")) {
    // API request → send JSON
    res.status(500).json({ success: false, message: err.message });
  } else {
    // SSR request → render error page
    res.status(500).render("error", {
      title: "error",
      user: req.user || null,
      message: "global error function" || err.message,
      url: err.url,
    });
  }
});

// Default Route
app.all("/*splat", (req, res) => {
  res.render("404", {
    layout: false,
    goBackUrl: req.cookies.previousPath || "/",
  });
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
