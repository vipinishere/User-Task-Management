const express = require("express");
const { 
    getUserProfile,
    getUserAllTasks,
    getLoginPageHandler,
    postLoginPageHandler,
    getRegisterPageHandler,
    postRegisterPageHandler,

} = require("../controllers/userController");
const userModel = require("../models/userModel");

const router = express.Router();

router.route("/register")
    .get(getRegisterPageHandler)
    .post(postRegisterPageHandler);

router.route("/login")
    .get(getLoginPageHandler)
    .post(postLoginPageHandler);

router.route("/profile")
    .get(getUserProfile);

router.route("/all-tasks")
    .get(getUserAllTasks);

router.route("/search")
.get(async(req, res, next)=> {
    const {name} = req.query;
    const users = await userModel.find({
        name: new RegExp(name, "i")
    }).limit(5);

    return res.json(users);
})

module.exports = router;