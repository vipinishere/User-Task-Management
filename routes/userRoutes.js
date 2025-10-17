const express = require("express");
const { 
    getUserProfile,
    getUserAllTasks,
    getLoginPageHandler,
    postLoginPageHandler,
    getRegisterPageHandler,
    postRegisterPageHandler,
    getUserTaskById,
    postUserTaskById,

} = require("../controllers/userController");
const userModel = require("../models/userModel");

const router = express.Router();


router.use(require("../middlewares/authMiddleware").authUser);


router.route("/")
    .get(getUserProfile);



router.route("/tasks")
    .get(getUserAllTasks);


router.route("/task/:id")
    .get(getUserTaskById)
    .post(postUserTaskById);


router.route("/logout")
    .get((req, res) => {
        res.clearCookie("token");
        return res.redirect("/user/login");
    });

router.route("/search")
.get(async(req, res)=> {
    const {name} = req.query;
    const users = await userModel.find({
        name: new RegExp(name, "i"),
        role: "user"
    }).select("-password -createdAt -updatedAt").limit(5);
    return res.json(users);
})


module.exports = router;