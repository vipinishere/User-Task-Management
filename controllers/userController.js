const userModel = require("../models/userModel");
const { hashPass } = require("../utils/bcrypt");

const getRegisterPageHandler = (req, res) => {
  res.render("register", {
    layout: false,
    title: "User | Register",
    who: "User",
    message: "",
  });
};

const postRegisterPageHandler = async (req, res) => {
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

    const hashedPass = await hashPass(password);

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

const getLoginPageHandler = (req, res) => {
  res.render("login", { layout: false, title: "User | Login", who: "User" });
};

const postLoginPageHandler = async (req, res) => {
  const { email, password } = req.body;

  /// Check if email or password is missing in the request body
  if (!email || !password) {
    return res.redirect("/user/login");
  }
  try {
    //GETTING ADMIN DATA FROM DB USING EMAIL
    const user = await userModel.findOne({ email });
    console.log(user);
    if (user) {
      // CAMPARING THE GIVEN PASSWORD WITH DB_STORED PASSWORD
      const rs = await comparePass(password, user.password);
      console.log(rs);

      if (rs) {
        // GENERATE JWT TOKEN (VALID FOR ONLY 1HOUR)
        try {
          const token = jwt.sign({ ...user }, process.env.JWT_SECRET_KEY);

          console.log(token);

          // SAVE TOKEN IN CLIENT SIDE
          return res
            .cookie("token", token, { httpOnly: true })
            .redirect("/user/profile")
            .json({ success: true });
        } catch (err) {
          return res.redirect("/user/login");
        }
      } else {
        return res.redirect("/user/login");
      }
    }
  } catch (err) {
    return res.redirect("/user/login").json({ message: err });
  }
};

const getUserProfile = (req, res) => {
  const user = {
    name: "user-name",
    role: "user",
  };
  res.render("./user/dashboard", { user, title: "user | Profile" });
};

const getUserAllTasks = (req, res) => {
  const tasks = [
    {
      title: "title",
      description: "hello there",
      status: "pending",
      priority: "high",
      assignedTo: "vipin",
      createdBy: "vipinishere",
    },
    {
      title: "title",
      description: "hello there",
      status: "pending",
      priority: "medium",
      assignedTo: "vipin",
      createdBy: "vipinishere",
    },
    {
      title: "title",
      description: "hello there",
      status: "pending",
      priority: "low",
      assignedTo: "vipin",
      createdBy: "vipinishere",
    }
  ];
  const user = {
    profileImage: "",
  };
  res.render("./user/userAllTask", { tasks, user, title: "user | Profile" });
};

module.exports = {
  getRegisterPageHandler,
  postRegisterPageHandler,
  getLoginPageHandler,
  postLoginPageHandler,
  getUserProfile,
  getUserAllTasks,
};
