const express = require("express");
const { 
    getUserProfile,
    getUserAllTasks, 
} = require("../controllers/userController");

const router = express.Router();

router.route("/profile")
    .get(getUserProfile);

router.route("/all-tasks")
    .get(getUserAllTasks);

module.exports = router;