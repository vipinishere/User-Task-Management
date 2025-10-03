const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");

const authCeo = async (req, res, next) => {
  console.log("function authceo");
  if(req.path === "/create") {
    return next();
  }

  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await ceoModel.findById(decoded._doc._id).select("-password");
      req.user = user;
      next();
    } catch (error) {
      return res.redirect("/ceo/login")
    }
  }
  if (!token) {
    return res.redirect("/ceo/login");
  }
};

module.exports = { authCeo };
