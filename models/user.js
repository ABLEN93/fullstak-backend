import mongoose from "mongoose";
import { hash, compare } from "../libs/crypto.js";

// Helper variables
const required = true;
const unique = true;
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required, unique, minLength: 3 },
  password: { type: String, required, minLength: 20 },
});

/**
 * This registers a new users into the database
 * @param {object} userData User to create
 * @returns {object} Created user or null if failed
 */
userSchema.statics.register = async (userData) => {
  try {
    userData.password = await hash(userData.password);
    return await User.create(userData);
  } catch (error) {
    console.log(error.message);
    // if (error.message.indexOf("email") !== -1) {
    //   console.error("Error registering user (email)");
    // } else {
    //   console.error(error.message);
    // }
    return null;
  }
};

/**
 * Try to login with provided user credentials
 *
 * @param {object} userData - object containing email and password in plaintext
 * @return {Promise<object>} - will resolve to user object if login was successful
 */
userSchema.statics.login = async (userData) => {
  const user = await User.findOne({ email: userData.email });

  if (!user) {
    return null;
  }

  const success = await compare(userData.password, user.password);

  if (!success) {
      return null;
  }

  return user.toJSON();
};

// This method is used for converting a User object to a simplified JSON representation
userSchema.methods.toJSON = function () {
    return {
        email: this.email,
        _id: this._id
    };
}

export const User = mongoose.model("fullstack-users", userSchema);
