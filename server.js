const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const expressEjsLayouts = require("express-ejs-layouts");

dotenv.config();
connectDB();

const app = express();

app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(morgan("dev"));
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/ceo", require("./routes/ceoRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

app.get("/", (req, res)=> {
  res.render("index", {layout: false})
})

app.post("/", (req, res)=> {
  const {selectedRole} = req.body;
  if(!selectedRole){
    res.redirect("/");
  }
  else if(selectedRole === "ceo"){
    res.redirect("/ceo/login");
  }
  else if(selectedRole === "admin"){
    res.redirect("/admin/login");
  }
  else if(selectedRole === "user"){
    res.redirect("/user/login")
  }
  else {
    res.redirect("/");
  }
})

app.get("/admin/profile", (req, res) => {
  const user = {
    name : "admin-name",
    role: "admin"
  }
  res.render("./admin/dashboard",{user, title: "Admin | Profile"});
});

app.get("/user/profile", (req, res) => {
  const user = {
    name : "user-name",
    role: "user"
  }
  res.render("./user/dashboard",{user, title: "user | Profile"});
});

app.get("/user/all-tasks", (req, res)=> {
  const user = {
    name : "user.name",
    role: "user"
  }
  res.render("./user/userAllTask", {user, title: "user | Profile" })
})

app.get("/:random", (req, res)=> {
  res.status(404).render("404", {layout: false})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
