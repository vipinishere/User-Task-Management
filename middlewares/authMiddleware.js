const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");

const authCeo = async (req, res, next) => {
  // 1. Get Token from Cookies
  const token = req.cookies.token;

  // 2. Public Route Exclusion (Better naming/structure)
  // Assuming '/ceo/create' is the correct route for creating a CEO user
  if (req.path === "/ceo/create") {
    return next();
  }

  // 3. Handle Missing Token
  if (!token) {
    // Log for debugging
    console.log("Access denied: No token provided.");
    return res.status(401).redirect("/ceo/login"); // Use 401 for clarity before redirect
  }

  try {
    // 4. Token Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // Standard JWT practice is to use the direct payload,
    // rather than assuming a nested '_doc' property.
    const user = decoded.user || decoded;
    if (!user || user.role !== "ceo") {
      console.warn(
        `Unauthorized access attempt. User ID: ${
          user ? user.id : "N/A"
        }, Role: ${user ? user.role : "N/A"}`
      );
      req.user = null;
      res.clearCookie("token");
      return res.status(403).redirect("/ceo/login");
    }
    req.user = user;
    next();
  } catch (err) {
    // 7. Token Verification Failure Handling (Expired, invalid signature, etc.)
    console.error(
      `Token verification failed for path ${req.path}. Error: ${err.name} - ${err.message}`
    );

    req.user = null;
    res.clearCookie("token");

    // Use 401 Unauthorized status before redirecting
    return res.status(401).redirect("/ceo/login");
  }
};

const authAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (req.path === "/login" || req.path === "/register") {
    return next();
  }

  if (!token) {
    return res.redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decoded;
    if (!user || user.role !== "admin") {
      req.user = null;
      res.clearCookie("token");
      return res.redirect("/admin/login");
    } else {
      req.user = user;
      console.log("Authenticated user:", user);
      next();
    }
  } catch (err) {
    console.log("Token verification failed:", err.message);

    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      console.log(err.name);
    }
    req.user = null;
    res.clearCookie("token");
    return res.redirect("/admin/login");
  }
};

const authUser = (req, res, next) => {
  const token = req.cookies.token;

  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/search"
  ) {
    return next();
  }

  console.log("checking token in user middleware", token);

  if (!token) {
    console.log("no token found, redirecting to login");
    return res.redirect("/user/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decoded;

    if (!user || user.role !== "user") {
      console.log("invalid role or user --> redirecting to login");
      req.user = null;
      res.clearCookie("token");
      return res.redirect("/user/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    req.user = null;
    res.clearCookie("token");
    return res.redirect("/user/login");
  }
};

module.exports = { authCeo, authAdmin, authUser };
