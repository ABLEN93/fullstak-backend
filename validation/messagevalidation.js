import { body } from "express-validator";

// This defines validation and sanitation for our message
// It specifically examines the body of a request and makes sure
// that if there is a message inside, the contents of the message is OK
export const messagerules = [
  body("message").isLength({ min: 0, max: 120 }).withMessage("message-length"),
  body("message").isAlphanumeric("de-DE").withMessage("message-invalid"),
  body("message").trim(),
  body("message").blacklist("e"),
];


// this isEmail method check if @ is exist
export const emailrules = [
  body("email").isEmail().withMessage("message-length"),

];

