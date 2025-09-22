const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ceoModel = require("../models/ceoModel");
const hashPass = require("../utils/bcrypt");
const userModel = require("../models/userModel");

const ceoCreateHandler = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // FIND LIST OF CEO, A COMPANY HAVE ONLY ONE
    const ceo = await ceoModel.find();

    // CHECKING ANY DATA AVAILABLE OR NOT
    if (!ceo[0]) {
      const hashedPass = await hashPass(password);

      //   CREATE A DATA INTO DATABASE
      const response = await ceoModel.create({
        fullName,
        email,
        password: hashedPass,
      });
      return res.json({
        message: "CEO Created!",
      });
    } else {
      return res.json({ message: "failed" });
    }
  } catch (err) {
    return res.json({ err });
  }
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
          const token = jwt.sign({ ...ceo }, process.env.JWT_SECRET_KEY);
          // SAVE TOKEN IN CLIENT SIDE
          return res
            .cookie("token", token, { httpOnly: true })
            .redirect("/ceo/profile");
        } catch (err) {
          return res.redirect("/ceo/login");
        }
      } else {
        return res.redirect("/ceo/login");
      }
    }
  } catch (err) {
    return res.redirect("/ceo/login");
  }
};

const showProfile = async (req, res) => {
  const user = {
    name: "h",
    email: "email",
    role: "ceo",
  };
  res.render("ceo/dashboard", { user: user, title: "CEO Deshboard" });
};

const getAllAdmin = async (req, res) => {
  try {
    let admins = await userModel.find({ role: "admin" });
  } catch (err) {
    return res.json({ err });
  }
};

module.exports = {
  ceoLoginHandler,
  getAllAdmin,
  ceoCreateHandler,
  showProfile,
};
