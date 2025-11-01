const express = require("express");
const multer = require("multer");
const path = require("node:path");
const router = express();

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

// controller functions
const {
  getLogoutHandler,
  getAdminDashboard,
  getSingleUser,
  getAllUsers,
  getAllTasks,
  getCreateTaskHandler,
  postCreateTaskHandler,
  deleteSingleTask,
  deleteUserAndTasks,
  getSingleTask,
  deleteSingleTaskforTasks,
} = require("../controllers/adminController");

const { authAdmin } = require("../middlewares/authMiddleware");

router.use(authAdmin);

router.route("/").get(getAdminDashboard);

router.route("/users").get(getAllUsers);
router.route("/logout").get(getLogoutHandler);
router.route("/tasks").get(getAllTasks);

router.get("/create-task", getCreateTaskHandler);
router.post("/create-task", upload.single("attachment"), postCreateTaskHandler);

router.get("/user/:id", getSingleUser);
router.route("/user/:id/delete").post(deleteUserAndTasks);
router.route("/user/:id/task/:taskId/delete").post(deleteSingleTask);

router.route("/task/:id").get(getSingleTask);
router.route("/task/:id/delete").post(deleteSingleTaskforTasks);

module.exports = router;
