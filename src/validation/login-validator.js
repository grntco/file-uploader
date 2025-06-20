const { body } = require("express-validator");

module.exports = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter your email.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("password").trim().notEmpty().withMessage("Please enter your password."),
];
