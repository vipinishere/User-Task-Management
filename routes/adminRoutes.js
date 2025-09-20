const express = require("express")
const userModel = require("../models/userModel")
const hashPass = require("../utils/hashPass")
const router = express()

router.get("/login", (req, res)=> {
    res.render("login", {layout: false, title: "Admin | Login", who: "Admin"})
})

router.post("/login", async (req, res) => {
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
      const rs = await bcrypt.compare(password, admin.password);

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
})

router.post("/register", async(req, res)=> {
    const {name, email, password} = req.body;

    // checking empty field
    if(!name || !email || !password){
        return res.status(400).json({sucess: false, message: "All Fields are Mendatary!"}).redirect("/admin/register")
    }

    
    try {
        // check existing user with email
        const existingUser = new userModel.findOne({email});

        if(existingUser) {
            return res.json({success: false, message: "user exist with this email"}).redirect("/admin/register")
        }
        
        // hashing the plain password
        const hashedPass = await hashPass(password);

        if(hashedPass){
            const newUser = new userModel.create({
            name,
            email,
            password: hashedPass,
            role: "admin"
        })
        

        if(newUser){
            return res.status(201).json({success: true, message: "register Successfully!", user: newUser})
        }
    }
    } catch (err) {
        return res.status(400).json({success: false, message: err}).redirect("/admin/register");
    }
})


module.exports = router