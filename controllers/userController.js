const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

// User Controllers

const getUserRegisterHandler = (req, res) => {
  res.render("register", {
    layout: false,
    title: "User | Register",
    who: "User",
    message: "",
  });
};

const postUserRegisterHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check required fields
    if (!name || !email || !password) {
      return res.render("register", {
        layout: false,
        title: "User |Register",
        who: "User",
        message: "All fields are required.",
      });
    }

    // check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        layout: false,
        title: "User | Register",
        who: "User",
        message: "User already exists!",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    if (!hashedPass) {
      return res.render("register", {
        layout: false,
        title: "User | Register",
        who: "User",
        message: "Something went wrong!",
      });
    } else {
      // save new user
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPass,
      });

      return res.render("register", {
        layout: false,
        title: "User | Register",
        who: "User",
        message: "Registration Successfully Go And Login",
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("register", {
      message: "❌ Something went wrong, try again.",
    });
  }
};

const getUserLoginHandler = (req, res) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded) {
        console.log("decoded token:", decoded);
        return res.redirect("/user");
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }
  }
  return res.render("login", {
    layout: false,
    title: "User | Login",
    who: "User",
  });
};

const postUserLoginHandler = async (req, res) => {
  const { email, password } = req.body;

  // 🧱 Validation: Missing email or password
  if (!email || !password) {
    return res.redirect("/user/login");
  }

  try {
    // Find user by email
    const user = await userModel.findOne({ email, role: "user" });

    if (!user) {
      return res.redirect("/user/login");
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.redirect("/user/login");
    }

    // token payload
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    // generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    if (!token) {
      return res.redirect("/user/login");
    }

    //send token in cookie
    return res.cookie("token", token, { httpOnly: true }).redirect("/user");
  } catch (err) {
    console.error("login err:", err);
    return res.redirect("/user/login");
  }
};

const getUserProfile = (req, res) => {
  const user = req.user;
  res.render("./user/dashboard", { user, title: "user | Profile" });
};

const getUserAllTasks = async (req, res) => {
  const user = req.user;
  console.log(user);
  console.log(user._id);
  const userId = user._id;
  console.log(userId);
  console.log(typeof userId);
  const myTasks = await taskModel.aggregate([
    {
      $match: { assignedTo: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByDetails",
      },
    },
    { $unwind: "$createdByDetails" },
    {
      $project: {
        title: 1,
        description: 1,
        priority: 1,
        status: 1,
        createdAt: 1,
        createdByName: "$createdByDetails.name",
        createdByEmail: "$createdByDetails.email",
      },
    },
  ]);
  // const myTasks = await taskModel.find({assignedTo: user._id});
  console.log(myTasks);
  res.render("./user/userAllTask", {
    tasks: myTasks,
    user,
    title: "user | Profile",
  });
};

const getUserTaskById = async (req, res) => {
  const { id } = req.params;

  const task = await taskModel.findById(id);

  if (!task) {
    return res.status(404).send("Task not found");
  }
  return res.status(200).render("./user/singleTask", {
    task,
    user: req.user,
    title: "user | Task",
  });
  //return res.send(task);
};

const postUserTaskById = async (req, res, next) => {
  const { id } = req.params;
  const { description, status } = req.body;

  const task = await taskModel.findById(id);

  if (!task) {
    return res.status(404).send("Task not found");
  }

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user-task-management",
      });

      if (result) {
        task.attachments = [
          {
            fileUrl: result.secure_url,
            fileName: result.original_filename,
          },
        ];
        task.description = description || task.description;
        task.status = status || task.status;
        await task.save();
        return res.status(200).redirect("/user/tasks");
      }
    }
    task.description = description || task.description;
    task.status = status || task.status;
    await task.save();
    return res.status(200).redirect("/user/tasks");
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
    next(err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getUserRegisterHandler,
  postUserRegisterHandler,
  getUserLoginHandler,
  postUserLoginHandler,
  getUserProfile,
  getUserAllTasks,
  getUserTaskById,
  postUserTaskById,
};
