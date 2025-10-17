const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

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
    return next({
      message: "All fields are required",
      url: "/admin/create-task",
    });
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
          return next({
            message: "Error in creating task",
            url: "/admin/create-task",
          });
        }
        return res.redirect("/admin/tasks");
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
        return next({
          message: "Error in creating task",
          url: "/admin/create-task",
        });
      }
      return res.redirect("/admin/tasks");
    }
  } catch (err) {
    console.log("error: (postCreateTaskHandler)", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next({
      message: "error: (postCreateTaskHandler)",
      url: "/admin/create-task",
    });
  }
};

const getLogoutHandler = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/admin/login");
};

module.exports = {
  getLoginPageHandler,
  postLoginPageHandler,
  getAllUsers,
  getLogoutHandler,
  getAdminDashboard,
  getAllTasks,
  getCreateTaskHandler,
  postCreateTaskHandler,
};
