const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");

const authCeo = async (req, res, next) => {
  const token = req.cookies.token;

  if (req.path === "/create") {
    return next();
  }

  if (!token) {
    return res.redirect("/ceo/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decoded._doc;
    if (!user || user.role !== "ceo") {
      req.user = null;
      res.clearCookie("token");
      return res.redirect("/ceo/login");
    } else {
      req.user = user;
      next();
    }
  } catch (err) {

    console.log("Token verification failed:", err.message);
    console.log("Error name:", err.name);
    req.user = null;
    res.clearCookie("token");
    return res.redirect("/ceo/login");
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
  
  if (req.path === "/login" || req.path === "/register" || req.path === "/search") {
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

const globelAuth = (req, res, next) => {};
module.exports = { authCeo, authAdmin, authUser, globelAuth };
