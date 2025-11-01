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
  deleteSingleTask,
  deleteUserAndTasks,
  getSingleTask,
  deleteSingleTaskforTasks,
} = require("../controllers/ceoController");
const { authCeo } = require("../middlewares/authMiddleware");
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
router.route("/task/:id/delete").post(deleteSingleTaskforTasks);

module.exports = router;
