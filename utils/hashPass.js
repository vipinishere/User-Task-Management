const bcrypt = require("bcrypt");

const hashPass = async (pass) => {
  const saltRounds = 10;
  try {
    const hashedPass = await bcrypt.hash(pass, saltRounds);
    return hashedPass;
  } catch (err) {
    console.log(err);
  }
};

module.exports = hashPass;
