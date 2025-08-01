const { body } = require("express-validator");

module.exports = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Please enter a name for your file."),
];
