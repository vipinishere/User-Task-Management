const express = require("express");
const multer = require("multer");
const path = require("node:path");
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
  deleteSingleTask,
  deleteUserAndTasks,
  getSingleTask,
  deleteSingleTaskforTasks,
  getEditSingleTask,
  editSingleTask,
} = require("../controllers/ceoController");
const { authCeo } = require("../middlewares/authMiddleware");

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
const router = express.Router();

router.post("/create", ceoCreateHandler);
router.use(authCeo);

router.get("/", getCeoDashboard);

// router.route("/login").get(getCeoLoginHandler).post(ceoLoginHandler)

router.get("/logout", ceoLogoutHandler);

router.route("/create-admin").get(getCreateAdmin).post(postCreateAdmin);

router.route("/create-user").get(getCreateAdmin).post(postCreateAdmin);

router.get("/admins", getAllAdmin);

router.route("/users").get(getAllUser);

router.route("/user/:id").get(getSingleUser);
router.route("/user/:id/delete").post(deleteUserAndTasks);
router.route("/user/:id/task/:taskId/delete").post(deleteSingleTask);

router.route("/tasks").get(getAllTask);
router.route("/task/:id").get(getSingleTask);
router
  .route("/task/:id/edit")
  .get(getEditSingleTask)
  .post(upload.single("attachment"), editSingleTask);
router.route("/task/:id/delete").post(deleteSingleTaskforTasks);

module.exports = router;
