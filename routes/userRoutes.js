const express = require("express");
const multer = require("multer");
const path = require("node:path");

const {
  getUserProfile,
  getUserAllTasks,
  getUserTaskById,
  postUserTaskById,
} = require("../controllers/userController");
const userModel = require("../models/userModel");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

//
router.use(require("../middlewares/authMiddleware").authUser);

router.route("/").get(getUserProfile);

router.route("/tasks").get(getUserAllTasks);

router.get("/task/:id", getUserTaskById);
router.post("/task/:id", upload.single("attachment"), postUserTaskById);

router.route("/logout").get((req, res) => {
  res.clearCookie("token");
  return res.redirect("/user/login");
});

router.route("/search").get(async (req, res) => {
  const { name } = req.query;
  const users = await userModel
    .find({
      name: new RegExp(name, "i"),
      role: "user",
    })
    .select("-password -createdAt -updatedAt")
    .limit(5);
  return res.json(users);
});

module.exports = router;
