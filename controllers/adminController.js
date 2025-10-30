const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// utility functions

const getLoginPageHandler = (req, res) => {
  if (req.cookies.token) {
    return res.redirect("/admin");
  } else {
    // console.log(req.user);
    return res.render("login", {
      layout: false,
      title: "Admin | Login",
      who: "Admin",
    });
  }
};

const postLoginPageHandler = async (req, res) => {
  const { email, password } = req.body;

  /// Check if email or password is missing in the request body
  if (!email || !password) {
    return res.redirect("/admin/login");
  }
  try {
    //GETTING ADMIN DATA FROM DB USING EMAIL
    const admin = await userModel.findOne({ email, role: "admin" });

    if (admin) {
      // CAMPARING THE GIVEN PASSWORD WITH DB_STORED PASSWORD
      const rs = await bcrypt.compare(password, admin.password);

      if (rs) {
        // GENERATE JWT TOKEN (VALID FOR ONLY 1HOUR)
        try {
          const payload = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
          const token = jwt.sign({ ...payload }, process.env.JWT_SECRET_KEY);
          // console.log(token);
          // SAVE TOKEN IN CLIENT SIDE
          res.cookie("token", token, { httpOnly: true });
          return res.redirect("/admin");
        } catch (err) {
          return res.redirect("/admin/login");
        }
      } else {
        return res.redirect("/admin/login");
      }
    }
  } catch (err) {
    return res.redirect("/admin/login");
  }
};

const getAdminDashboard = (req, res) => {
  const user = req.user;
  return res.render("./admin/dashboard", { user, title: "Admin | Profile" });
};

const getSingleUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user;
    const user = await userModel.findById(userId).lean();
    console.log(req.user);

    if (!user) {
      return res
        .status(404)
        .redirect("/admin/users?status=error&message=User not found");
    }

    // fetch tasks where user is either creator or assigned to
    const tasks = await taskModel
      .find({
        $and: [{ createdBy: loggedInUser.id }, { assignedTo: userId }],
      })
      .lean();

    console.log("tasks:", tasks);

    // if (!tasks[0]) {
    //   return res
    //     .status(404)
    //     .redirect(`/admin/user/${userId}?status=error&message=Tasks not found`);
    // }
    // console.log(user);

    return res.render("./ceo/singleUser", {
      tasks,
      title: "single user",
      user: loggedInUser,
      singleUser: user,
    });
  } catch (err) {
    console.error(err);
    return next({ err: "while fatching user data" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: "user" }).select("-password");
    const user = req.user;
    return res.render("./admin/allUser", {
      user,
      users,
      title: "Admin | All Users",
    });
  } catch (error) {
    return next({
      message: "Error in fetching all users",
      url: "/admin/users",
    });
  }
};

const getSingleTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await taskModel.findById(taskId);
    if (!task) {
    }
    return res.status(200).render("./admin/singleTaskPage", {
      title: "Admin || Task Page",
      user: req.user,
      task,
    });
  } catch (err) {
    console.log("GetSingleTask Error: ", err);
    res
      .status(500)
      .redirect(
        `/admin/tasks?status=error&message=${encodeURIComponent(
          "something went wrong!"
        )}`
      );
  }
};

const getAllTasks = async (req, res, next) => {
  const user = req.user;
  // console.log("getAllTasks user:", user);
  try {
    const tasks = await taskModel.find({ createdBy: user.id });

    // console.log("length of tasks:", tasks.length);
    if (tasks.length === 0) {
      return res.render("./admin/allTask", {
        user,
        tasks: [],
        title: "Admin | All Tasks",
        isTaskAvailable: false,
      });
    } else {
      return res.render("./admin/allTask", {
        user,
        tasks,
        title: "Admin | All Tasks",
        isTaskAvailable: true,
      });
    }
  } catch (err) {
    return next({
      message: "Error in fetching all tasks",
      url: "/admin/tasks",
    });
  }
};

const getCreateTaskHandler = (req, res) => {
  const user = req.user;
  return res.render("./admin/createTask", {
    user,
    title: "Admin | Create Task",
  });
};

const postCreateTaskHandler = async (req, res, next) => {
  const {
    title,
    description,
    status,
    priority,
    deadline,
    assignedTo,
    createdBy,
  } = req.body;

  const user = req.user;

  if (
    !title ||
    !description ||
    !assignedTo ||
    !status ||
    !priority ||
    !deadline ||
    !createdBy
  ) {
    res
      .status(400)
      .redirect(
        `/admin/create-task?status=error&message=${encodeURIComponent(
          "All Fields are Required"
        )}`
      );
  }

  try {
    let attachments = [];
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user-task-management",
      });
      fs.unlinkSync(req.file.path);

      if (result) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        attachments.push({
          fileUrl: result.secure_url,
          fileName: result.original_filename,
        });

        const newtask = await taskModel.create({
          title,
          description,
          status,
          priority,
          deadline,
          assignedTo,
          createdBy,
          attachments,
        });

        if (!newtask) {
          return res
            .status(400)
            .redirect(
              `/admin/create-task?status=error&message=${encodeURIComponent(
                "Something went wrong!"
              )}`
            );
        }
        return res
          .status(200)
          .redirect(
            `/admin/tasks?status=success&message=${encodeURIComponent(
              "Task Created Successfully!"
            )}`
          );
      }
    } else {
      const newtask = await taskModel.create({
        title,
        description,
        status,
        priority,
        deadline,
        assignedTo,
        createdBy,
      });

      if (!newtask) {
        return res
          .status(400)
          .redirect(
            `/admin/create-task?status=error&message=${encodeURIComponent(
              "Something went wrong!"
            )}`
          );
      }
      return res
        .status(200)
        .redirect(
          `/admin/tasks?status=success&message=${encodeURIComponent(
            "Task Created Successfully!"
          )}`
        );
    }
  } catch (err) {
    console.log("PostCreateTaskHandler Error: ", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(500)
      .redirect(
        `/admin/tasks?status=error&message=${encodeURIComponent(
          "Internal Server Error!"
        )}`
      );
  }
};

const deleteSingleTask = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const taskId = req.params.taskId;

    const task = await taskModel.findById(taskId);
    if (!task) {
      const errorMsg = "The requested action failed due to validation issues.";
      res.redirect(
        `/admin/user/${userId}?status=error&message=${encodeURIComponent(
          errorMsg
        )}`
      );
    }

    if (task.attachments[0]) {
      const url = task.attachments[0].fileUrl;
      const parts = url.split("/");
      // console.log("parts: ", parts);

      // parts will be an array of substrings

      // 2. Get the last element of the array (which is "kpsznzghodhbqvixyzsr.png")
      const filenameWithExtension = parts.pop();
      // console.log("filenamewithextension: ", filenameWithExtension);

      // 3. Remove the ".png" extension
      const publicId = `user-task-management/${
        filenameWithExtension.split(".")[0]
      }`;

      // console.log("publicId", publicId);

      const isDone = await cloudinary.uploader.destroy(publicId);

      // console.log("isdone: ", isDone);
    }

    const isdeleted = await task.deleteOne(); // or Task.findByIdAndDelete(id)

    return res
      .status(200)
      .redirect(
        `/admin/user/${userId}?status=success&message=${encodeURIComponent(
          "Task Deleted Successfully"
        )}`
      );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .redirect(
        `/admin/user/${userId}?status=error&message=${encodeURIComponent(
          err.message
        )}`
      );
  }
};

const deleteUserAndTasks = async (req, res, next) => {
  const userId = req.params.id;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // Delete the user
    const user = await userModel.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .redirect(
          `/admin/user/${userId}?status=error&message=${encodeURIComponent(
            "Something Went Wrong"
          )}`
        );
    }

    // Delete tasks created by or assigned to the user
    const deleteResult = await taskModel.deleteMany(
      {
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      },
      { session: session }
    );

    await userModel.deleteOne({ _id: userId }, { session: session });

    await session.commitTransaction();
    await session.endSession();

    return res
      .status(200)
      .redirect(
        `/admin/users?status=success&message=${encodeURIComponent(
          "User Deleted Successfully!"
        )}`
      );
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error(err);
    return res
      .status(500)
      .redirect(
        `/admin/users?status=error&message=${encodeURIComponent(err.message)}`
      );
  } finally {
    await session.endSession();
  }
};

const getLogoutHandler = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/admin/login");
};

module.exports = {
  getLoginPageHandler,
  postLoginPageHandler,
  getSingleUser,
  getAllUsers,
  getLogoutHandler,
  getAdminDashboard,
  getSingleTask,
  getAllTasks,
  getCreateTaskHandler,
  postCreateTaskHandler,
  deleteSingleTask,
  deleteUserAndTasks,
};
