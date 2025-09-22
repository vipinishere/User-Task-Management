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
app.use("/", require("./routes/homeRoutes"));
app.use("/ceo", require("./routes/ceoRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));


// Default Route
app.all("/*splat", (req, res)=> {
  res.render("404", {
    layout: false
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
