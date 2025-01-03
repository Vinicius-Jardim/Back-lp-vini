import { User } from "../models/usersModel.js";
import { HttpStatus } from "../utils/httpStatus.js";

export const checkUserExists = async (req, res, next) => {
  try {
    const userId = req.user; // Supõe que o ID do usuário já está no `req.user` (ex: extraído do token)

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    req.user = user._id;
    next();
  } catch (error) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
