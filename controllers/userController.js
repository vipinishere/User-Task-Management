const getRegisterPageHandler = (req, res) => {
  res.render("register", {layout: false, title: "User | Register", who: "User"})
}

const postRegisterPageHandler = (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        
    }
}

const getUserProfile = (req, res) => {
  const user = {
    name : "user-name",
    role: "user"
  }
  res.render("./user/dashboard",{user, title: "user | Profile"});
}

const getUserAllTasks = (req, res)=> {
  const user = {
    name : "user.name",
    role: "user"
  }
  res.render("./user/userAllTask", {user, title: "user | Profile" })
}

module.exports = {
    getRegisterPageHandler,
    postRegisterPageHandler,
    getUserProfile,
    getUserAllTasks
}