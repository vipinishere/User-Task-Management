const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const { imageUrlToPublicId } = require("../utils/imagePublicId.utils");

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
    return res
      .status(400)
      .redirect("/admin/login?status=error&message=All fields are required");
  }
  try {
    //GETTING ADMIN DATA FROM DB USING EMAIL
    const admin = await userModel.findOne({ email, role: "admin" });

    if (!admin) {
      return res
        .status(500)
        .redirect("/admin/login?status=error&message=Invalid Credentials");
    }
    // CAMPARING THE GIVEN PASSWORD WITH DB_STORED PASSWORD
    const rs = await bcrypt.compare(password, admin.password);

    if (!rs) {
      return res
        .status(500)
        .redirect("/admin/login?status=error&message=Invalid Credentials");
    }

    // GENERATE JWT TOKEN (VALID FOR ONLY 1HOUR)

    const payload = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    const token = jwt.sign({ ...payload }, process.env.JWT_SECRET_KEY);

    if (!token) {
      return res
        .status(500)
        .redirect("/admin/login?status=error&message=Could not generate token");
    }
    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/admin?status=success&message=Login Successful");
  } catch (err) {
    return res
      .status(500)
      .redirect("/admin/login?status=error&message=Something went wrong");
  }
};

const getAdminDashboard = (req, res) => {
  const user = req.user;
  const totalUsersPromise = userModel.countDocuments({ role: "user" });
  const totalTasksPromise = taskModel.countDocuments({
    $and: [{ createdBy: user.id }, { status: "pending" }],
  });
  Promise.all([totalUsersPromise, totalTasksPromise])
    .then(([totalUsers, totalTasks]) => {
      return res.render("./admin/dashboard", {
        user,
        totalUsers,
        totalTasks,
        title: "Admin | Profile",
      });
    })
    .catch((err) => {
      console.error("Error fetching dashboard data:", err);
      return res.render("./admin/dashboard", {
        user,
        title: "Admin | Profile",
      });
    });
};

const getSingleUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user;
    const user = await userModel.findById(userId).lean();

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

    return res.render("./ceo/singleUser", {
      tasks,
      title: "single user",
      user: loggedInUser,
      singleUser: user,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .redirect("/admin/users?status=error&message=Server Error");
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: "user" }).select("-password");
    return res.render("./admin/allUser", {
      user: req.user,
      users,
      title: "Admin | All Users",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).redirect("/admin?status=error&message=Server Error");
  }
};

const getSingleTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await taskModel.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .redirect(
          `/admin/tasks?status=error&message=${encodeURIComponent(
            "Task not found!"
          )}`
        );
    }
    return res.status(200).render("./admin/singleTaskPage", {
      title: "Admin || Task Page",
      user: req.user,
      task,
    });
  } catch (err) {
    console.log("GetSingleTask Error: ", err);
    return res
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
    console.log("GetAllTasks Error: ", err);
    return res
      .status(500)
      .redirect(
        `/admin?status=error&message=${encodeURIComponent(
          "Internal Server Error!"
        )}`
      );
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

      const publicId = imageUrlToPublicId(url);

      const isDone = await cloudinary.uploader.destroy(publicId);
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
