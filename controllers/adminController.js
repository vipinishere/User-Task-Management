const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

// utility functions
const { comparePass } = require("../utils/bcrypt");


const getLoginPageHandler = (req, res)=> {
    res.render("login", {layout: false, title: "Admin | Login", who: "Admin"})
}

const postLoginPageHandler = async (req, res) => {
  const { email, password } = req.body;

  /// Check if email or password is missing in the request body
  if (!email || !password) {
    return res.redirect("/admin/login");
  }
  try {
    //GETTING ADMIN DATA FROM DB USING EMAIL
    const admin = await userModel.findOne({ email });
    if (admin) {
      // CAMPARING THE GIVEN PASSWORD WITH DB_STORED PASSWORD
      const rs = await comparePass(password, admin.password);

      if (rs) {
        // GENERATE JWT TOKEN (VALID FOR ONLY 1HOUR)
        try {
          const token = jwt.sign({ ...admin }, process.env.JWT_SECRET_KEY);
          // SAVE TOKEN IN CLIENT SIDE
          return res
            .cookie("token", token, { httpOnly: true })
            .redirect("/admin/profile");
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
}


module.exports = {
    getLoginPageHandler,
    postLoginPageHandler
}