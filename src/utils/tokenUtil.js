import jwt from "jsonwebtoken";
import config from "../../config.js";

const decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secretKey, (err, decoded) => {
      if (err) {
        console.log("Error:" + err);
        reject();
        return { auth: false, message: "Failed to authenticate" };
      }
      return resolve(decoded);
    });
  });
};

const createToken = (user) => {
  let token = jwt.sign({ id: user._id, role: user.role }, config.secretKey, {
    expiresIn: config.expiresIn,
  });
  return { auth: true, token: token };
};

const createTokenPasswordReset = (user) => {
  let token = jwt.sign({ id: user._id }, config.secretKey, {
    expiresIn: 300,
  });
  return token;
};

export { decodeToken, createToken, createTokenPasswordReset };
