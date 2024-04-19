// Import express-validator
import { body, validationResult } from "express-validator";

// Define the validator middleware function
export const validateRegisterUser = [
  // Validate fullName
  body("fullName").trim().notEmpty().withMessage("Full name is required"),

  // Validate username (optional)
  body("username").trim().notEmpty().withMessage("Username is required"),

  // Validate email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  // Validate password
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
