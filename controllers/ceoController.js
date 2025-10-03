const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");
const userModel = require("../models/userModel");
const taskModel = require("../models/taskModel");

const getCeoDashboard = async (req, res) => {
  const user = req.user;

  const allUsers = await userModel.find();
  const pendingTasks = await taskModel.find({status: "pending"});
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
}

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
        role: "ceo"
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

const getCeoLoginHandler = async (req, res) => {
  const token = req.cookies.token;
  // console.log(token);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // console.log(decoded._doc.role)
      if (decoded._doc.role === "ceo") {
        return res.redirect("/ceo");        
      }
    } catch (err) {
      console.log(err);
    }
  }
  return res.render("login", {
    layout: false,
    who: "CEO",
    title: "CEO | Login",
  });
};

const ceoLoginHandler = async (req, res) => {
  const { email, password } = req.body;

  /// Check if email or password is missing in the request body

  if (!email || !password) {
    return res.redirect("/ceo/login");
  }

  try {
    //GETTING CEO DATA FROM DB USING EMAIL
    const ceo = await ceoModel.findOne({ email });
    if (ceo) {
      // CAMPARING THE GIVEN PASSWORD WITH DB_STORED PASSWORD
      const rs = await bcrypt.compare(password, ceo.password);

      if (rs) {
        // GENERATE JWT TOKEN (VALID FOR ONLY 1HOUR)
        try {
          const token = jwt.sign({ ...ceo }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
          });
          // SAVE TOKEN IN CLIENT SIDE
          return res
            .cookie("token", token, { httpOnly: true })
            .redirect("/ceo");
        } catch (err) {
          return res.render("/ceo/login", {
            layout: false,
            who: "CEO",
            title: "CEO | Login",
          });
        }
      } else {
        return res.redirect("/ceo/login");
      }
    }
  } catch (err) {
    return res.redirect("/ceo/login");
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

const getCreateAdmin = async (req, res) => {
  res
    .status(200)
    .render("./ceo/createAdmin", { title: "abc", user: req.user, success: null });
};

const postCreateAdmin = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const url = req.originalUrl;

  try {
    if (!name || !email || !password || !role) {
      return res.render("error", {
        title: "",
        user: req.user,
        message: "Something is missing",
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
        message: "something went wrong",
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
      title: "abc",
      user: req.user,
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
  const parameters = req.params;
  console.log(parameters.id);

  try {
    const singleUser = await userModel.findById(parameters.id);
    if (!singleUser) {
      return next({ err: "while fatching user data" });
    }
    console.log(singleUser);

    return res.render("./ceo/singleUser", {
      title: "single user",
      user: req.user,
      singleUser,
    });
  } catch (err) {}
};

const getAllTask = async(req, res, next) => {
  try {
    const allTasks = await taskModel.find();
    console.log(allTasks)
    
    if(allTasks[0]) {
      return res.render("./ceo/allTask", {
        title: "all Task",
        user: req.user,
        tasks : allTasks,
        isTaskAvailable: true
      })
    }
    else {
      return res.render("./ceo/allTask", {
        title: "all Task",
        user: req.user,
        tasks: null,
        isTaskAvailable: false,
      })
    }
  } catch (err) {
    console.log(err)
  }
}


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
};
