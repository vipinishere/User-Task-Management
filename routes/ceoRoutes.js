const express = require("express");
const {
  ceoLoginHandler,
  getAllAdmin,
  ceoCreateHandler,
  showProfile,
} = require("../controllers/ceoController");
const ceoModel = require("./../models/ceoModel");
const hashPass = require("../utils/bcrypt");
const { authorizeCeo } = require("../middlewares/ceoMiddleware");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", {layout: false, who: "CEO", title: "CEO | Login"});
});

router.post("/create", ceoCreateHandler);

router.post("/login", ceoLoginHandler);

// router.get("/profile", showProfile);
router.get("/profile", async(req,res)=> {
  const user = {
    name: "vipin",
    role: "ceo"
  }
  res.render("./ceo/dashboard", {user, title: "CEO | Profile"})
})

router.get("/admins", getAllAdmin);

module.exports = router;
