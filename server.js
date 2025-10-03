const express = require("express");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const expressEjsLayouts = require("express-ejs-layouts");
const { getCeoLoginHandler, ceoLoginHandler } = require("./controllers/ceoController");


dotenv.config();
connectDB();

const app = express();

app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Routes
app.use("/", require("./routes/homeRoutes"));
app.get("/ceo/login", getCeoLoginHandler);
app.post("/ceo/login", ceoLoginHandler);
app.use("/ceo", require("./routes/ceoRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));

// Globel Error
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const user = {
    profileImaga: "kddk",
    role: "ceo",
  };

  if (req.originalUrl.startsWith("/api")) {
    // API request → send JSON
    res.status(500).json({ success: false, message: err.message });
  } else {
    // SSR request → render error page
    res.status(500).render("error", {
      title: "error",
      user,
      message: "globel error function" || err.message,
      url: err.url,
    });
  }
});

// Default Route
app.all("/*splat", (req, res) => {
  res.render("404", {
    layout: false,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
