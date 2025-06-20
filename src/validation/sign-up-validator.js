const { body } = require("express-validator");
const prisma = require("../../prisma/prisma-client");

module.exports = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Please enter a first name.")
    .bail()
    .isLength({ min: 2, max: 16 })
    .withMessage("A name must be between 2 and 16 characters."),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Please enter a last name.")
    .bail()
    .isLength({ min: 2, max: 16 })
    .withMessage("A name must be between 2 and 16 characters."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter an email.")
    .bail()
    .isEmail()
    .withMessage("Please enter a a valid email address.")
    .bail()
    .isLength({ min: 6, max: 100 })
    .withMessage("An email must be between 6 and 100 characters.")
    .custom(async (value) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: value },
      });
      if (existingUser) {
        throw new Error("The email provided is already taken.");
      }
      return true;
    })
    .withMessage("The email provided is already taken."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please enter a password.")
    .bail()
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password not strong enough. Please enter at least 8 characters, including 1 uppercase letter, 1 number, and 1 symbol."
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords entered do not match.");
    }
    return true;
  }),
];
