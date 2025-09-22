const express = require("express")
const router = express()

// import user model
const userModel = require("../models/userModel")

// utility functions
const hashPass = require("../utils/bcrypt")

// controller functions
const { 
  getLoginPageHandler,
  postLoginPageHandler 
} = require("../controllers/adminController")


router.route("/login")
    .get(getLoginPageHandler)
    .post(postLoginPageHandler)
    

router.get("/profile",(req, res) => {
  const user = {
    name : "admin-name",
    role: "admin"
  }
  res.render("./admin/dashboard",{user, title: "Admin | Profile"});
});


module.exports = router