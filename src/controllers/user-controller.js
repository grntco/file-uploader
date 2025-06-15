const bcrypt = require("bcryptjs");

// GETS
const signUpGet = (req, res, next) => {
  res.render("sign-up", { title: "Sign Up", errors: [], formData: {} });
};

const loginGet = (req, res, next) => {
  res.render("login", { title: "Login", errors: [], formData: {} });
};

// POSTS
// TODO: should validate with express validator...
const signUpPost = (req, res, next) => {};

module.exports = {
  signUpGet,
  loginGet,
};
