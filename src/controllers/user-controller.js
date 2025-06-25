const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const validateSignUp = require("../validation/sign-up-validator");
const validateLogin = require("../validation/login-validator");
const prisma = require("../../prisma/prisma-client");
const passport = require("../config/passport-config");

// GETS
const signUpGet = (req, res, next) => {
  res.render("sign-up", { title: "Sign Up", errors: [], formData: {} });
};

const loginGet = (req, res, next) => {
  const flashErrors = req.flash("error");
  const errors = flashErrors.map((error) => ({ msg: error })); // converts flash errors to be like express-validator errors

  res.render("login", { title: "Login", errors });
};

const logoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You successfully logged out.");
    res.redirect("/login");
  });
};

// POSTS
const signUpPost = [
  validateSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(),
        formData: req.body,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      await prisma.user.create({
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hashedPassword,
        },
      });

      req.flash("success", "Thanks for creating an account! Please log in.");
      res.redirect("/login");
    } catch (err) {
      console.error("Sign Up Error: ", err);
      next();
    }
  },
];

const loginPost = [
  validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("login", {
        errors: errors.array(),
      });
    }

    passport.authenticate("local", {
      failureRedirect: "/login",
      successRedirect: "/files",
      failureFlash: true,
    })(req, res, next);
  },
];

module.exports = {
  signUpGet,
  loginGet,
  logoutGet,
  signUpPost,
  loginPost,
};
