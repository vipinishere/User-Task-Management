const express = require("express");
const {
  getAllAdmin,
  ceoCreateHandler,
  getCreateAdmin,
  postCreateAdmin,
  getAllUser,
  getSingleUser,
  ceoLogoutHandler,
  getCeoDashboard,
  getAllTask,
} = require("../controllers/ceoController");
const ceoModel = require("./../models/ceoModel");
const hashPass = require("../utils/bcrypt");
const { authCeo } = require("../middlewares/authMiddleware");
const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const router = express.Router();

router.use(authCeo);

router.get("/", getCeoDashboard);

router.post("/create", ceoCreateHandler);

// router.route("/login").get(getCeoLoginHandler).post(ceoLoginHandler)

router.get("/logout", ceoLogoutHandler);

router.route("/create-admin").get(getCreateAdmin).post(postCreateAdmin);

router.get("/admins", getAllAdmin);

router.route("/users").get(getAllUser);

router.route("/user/:id").get(getSingleUser);

router.route("/tasks").get(getAllTask);

module.exports = router;
