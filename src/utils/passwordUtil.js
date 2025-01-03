import bcrypt from "bcrypt";
import config from "../../config.js";

const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

const createPassword = (password) => {
  return bcrypt.hash(password, config.saltRounds);
};

export { comparePassword, createPassword };
