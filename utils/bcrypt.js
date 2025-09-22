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

const comparePass = async (givenPass, storedPass) => {
    try {
      return result = await bcrypt.compare(givenPass, storedPass);
    } catch (err) {
      return err;
    }
}

module.exports = {
  hashPass,
  comparePass
};
