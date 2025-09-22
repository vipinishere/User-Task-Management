const getIndexHandler = (req, res)=> {
  res.render("index", {layout: false})
}

const postIndexHandler = (req, res)=> {
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
}

module.exports = {
    getIndexHandler,
    postIndexHandler
}