const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");
const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");
const { default: mongoose } = require("mongoose");

const getCeoDashboard = async (req, res) => {
  const user = req.user;

  const allUsers = await userModel.find();
  const pendingTasks = await taskModel.find({ status: "pending" });
  const [totalAdmin, totalUser] = allUsers.reduce(
    (acc, user) => {
      if (user.role === "admin") {
        acc[0].push(user);
      } else {
        acc[1].push(user);
      }
      return acc;
    },
    [[], []]
  );

  return res.render("./ceo/dashboard", {
    user,
    totalAdmin: totalAdmin.length,
    totalUser: totalUser.length,
    pendingTasks: pendingTasks.length,
    title: "CEO | Profile",
  });
};

const ceoCreateHandler = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // FIND LIST OF CEO, A COMPANY HAVE ONLY ONE
    const ceo = await ceoModel.find();

    // CHECKING ANY DATA AVAILABLE OR NOT
    if (!ceo[0]) {
      const hashedPass = await bcrypt.hash(password, 10);

      //   CREATE A DATA INTO DATABASE
      const response = await ceoModel.create({
        fullName,
        email,
        password: hashedPass,
        role: "ceo",
      });
      if (response) {
        return res.json({
          message: "CEO Created!",
        });
      }
    } else {
      return res.json({ message: "failed" });
    }
  } catch (err) {
    return res.json({ err: err });
  }
};

const getCeoLoginHandler = (req, res) => {
  // 1. Get Token from Cookies
  const token = req.cookies.token;

  if (token) {
    try {
      // 2. Token Verification (Synchronous)
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = decoded.user || decoded;

      // 3. Authorization Check
      if (user && user.role === "ceo") {
        return res.redirect("/ceo");
      }
    } catch (err) {
      console.warn(
        `Attempted login with bad token on /ceo/login. Error: ${err.name}`
      );
      res.clearCookie("token");
      // Execution continues to rendering the login page below.
    }
  }

  // 5. Render Login Page
  // If no token, token is invalid/expired, or token belongs to a non-CEO user.
  return res.render("login", {
    layout: false,
    who: "CEO",
    title: "CEO | Login",
  });
};

const ceoLoginHandler = async (req, res) => {
  // Helper function for consistent error redirection
  const redirectToLoginWithError = (message) => {
    // Encode the error message to safely pass it in the URL
    return res.redirect(`/ceo/login?error=${encodeURIComponent(message)}`);
  };

  const { email, password } = req.body;

  // --- 1. Input Validation ---
  if (!email || !password) {
    console.error("Attempted CEO login missing credentials.");
    return redirectToLoginWithError("Email and password are required.");
  }

  try {
    // --- 2. Fetch CEO Data ---
    const ceo = await ceoModel.findOne({ email }).lean();
    console.log(ceo);

    if (!ceo) {
      console.error(`Login attempt failed: CEO not found for email: ${email}`);
      // Use a generic error message for security reasons
      return redirectToLoginWithError(
        "Invalid credentials or account does not exist."
      );
    }

    // --- 3. Password Comparison ---
    const isMatch = await bcrypt.compare(password, ceo.password);

    if (!isMatch) {
      console.error(
        `Login attempt failed: Password mismatch for user ID: ${ceo._id}`
      );
      // Use a generic error message for security reasons
      return redirectToLoginWithError(
        "Invalid credentials or account does not exist."
      );
    }

    // --- 4. JWT Token Generation and Session Creation ---
    const payload = {
      id: ceo._id,
      fullName: ceo.fullName,
      email: ceo.email,
      role: ceo.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h", // Token valid for 1 hour
    });

    // --- 5. Success: Set Cookie and Redirect ---
    // Setting the JWT as an HttpOnly cookie for security (prevents XSS access)
    return res
      .cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", // Use secure in production
        // sameSite: "Lax", // Recommended for CSRF mitigation
        maxAge: 60 * 60 * 1000, // 1 hour (matching token expiry)
      })
      .redirect("/ceo"); // Redirect to the CEO dashboard
  } catch (error) {
    console.error("CEO Login Error:", error);

    // This handles database connection issues, findOne errors, or JWT signing errors
    // (though JWT signing errors are rare unless the secret key is missing).
    let errorMessage =
      "An unexpected server error occurred during login. Please try again.";

    if (!process.env.JWT_SECRET_KEY) {
      errorMessage = "Server configuration error: JWT secret key is missing.";
    }

    return redirectToLoginWithError(errorMessage);
  }
};

const ceoLogoutHandler = async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    return res.clearCookie("token").redirect("/ceo/login");
  }
  return res.redirect("/ceo/login");
};

const getAllAdmin = async (req, res, next) => {
  try {
    let admins = await userModel.find({ role: "admin" });
    // console.log(admins);
    return res.status(200).render("./ceo/allAdmin", {
      title: "all Admin",
      user: req.user,
      admins,
    });
  } catch (err) {
    next(err);
  }
};

const getCreateAdmin = (req, res) => {
  const roleFor = req.originalUrl.includes("create-admin") ? "admin" : "user";
  console.log(roleFor)
  return res.status(200).render("./ceo/createAdmin", {
    title: "Create Admin",
    user: req.user,
    data: {
      roleFor,
    },
    success: null,
  });
};

const postCreateAdmin = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // console.log(req.body)
  const url = req.originalUrl;
  const roleFor = url.includes("create-admin") ? "admin": "user";

  try {
    if (!name || !email || !password || !role) {
      return res.render("error", {
        title: "Error",
        user: req.user,
        message: "input field is missing",
        url: url,
      });
    }

    // check existing user
    const existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.render("error", {
        title: "Error",
        user: req.user,
        message: "User exits already",
        url: url,
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    // console.log("hashed password: ", hashedPass)

    if (!hashedPass) {
      return res.render("error", {
        title: "Error",
        user: req.user,
        message: "hashed password not getting",
        url: url,
      });
    }

    const createdOne = await userModel.create({
      name,
      email,
      password: hashedPass,
      role,
    });

    if (!createdOne) {
      return next({ message: "while creating user", url });
    }

    return res.render("./ceo/createAdmin", {
      title: `CEO || Create ${roleFor}`,
      user: req.user,
      data: {
        roleFor
      },
      success: `${role} Created!`,
    });
  } catch (err) {
    console.log(err);
    return next({ message: "while creating admin", url });
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: "user" });

    if (!users) {
      next({ message: "error: while fatching users data" });
    }

    return res.render("./ceo/allUser", {
      title: "CEO || Users",
      user: req.user,
      users,
    });
  } catch (err) {
    next({ err: "something went wrong" });
  }
};

const getSingleUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // fetch tasks where user is either creator or assigned to
    const tasks = await taskModel
      .find({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      })
      .lean();

    if (!user) {
      return next({ err: "while fatching user data" });
    }
    console.log(user);

    return res.render("./ceo/singleUser", {
      tasks,
      title: "single user",
      user: req.user,
      singleUser: user,
    });
  } catch (err) {
    console.error(err);
    return next({ err: "while fatching user data" });
  }
};

const getAllTask = async (req, res, next) => {
  try {
    const allTasks = await taskModel
      .find({}, "-__v")
      .populate({ path: "createdBy", select: "-password -__v" })
      .populate({ path: "assignedTo", select: "-password -__v" });
    console.log(allTasks);

    if (allTasks[0]) {
      return res.render("./ceo/allTask", {
        title: "all Task",
        user: req.user,
        tasks: allTasks,
        isTaskAvailable: true,
      });
    } else {
      return res.render("./ceo/allTask", {
        title: "all Task",
        user: req.user,
        tasks: null,
        isTaskAvailable: false,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const deleteSingleTask = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const taskId = req.params.taskId;

    const task = await taskModel.findById(taskId);
    if (!task) {
      const errorMsg = "The requested action failed due to validation issues.";
      res.redirect(`/ceo/user/${userId}?error=${encodeURIComponent(errorMsg)}`);
    }

    const isdeleted = await task.deleteOne(); // or Task.findByIdAndDelete(id)

    return res.status(200).redirect(`/ceo/user/${userId}`);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .redirect(`/ceo/user/${userId}?error=${encodeURIComponent(err.message)}`);
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
      return res.status(404).redirect(`/ceo/user/${userId}`);
    }

    // Delete tasks created by or assigned to the user
    const deleteResult = await taskModel
      .deleteMany({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      })
      .session(session);

    await userModel.deleteOne({ _id: userId }).session(session);

    await session.commitTransaction();
    await session.endSession();

    return res.status(200).redirect("/ceo/users");
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error(err);
    return res
      .status(500)
      .redirect(`/ceo/users?error=${encodeURIComponent(err.message)}`);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getCeoDashboard,
  ceoLoginHandler,
  getAllAdmin,
  getCeoLoginHandler,
  ceoCreateHandler,
  getCreateAdmin,
  postCreateAdmin,
  getAllUser,
  getAllTask,
  getSingleUser,
  ceoLogoutHandler,
  deleteSingleTask,
  deleteUserAndTasks,
};
