import { User, roles } from "../../models/usersModel.js";
import { tokenPasswordReset } from "../../middlewares/verifyToken.js";
import { Wishlist } from "../../models/wishlistModel.js";
import { saveFilesToDisk } from "../../middlewares/uploadImage.js";
import { deleteFile } from "../../utils/dataUtil.js";
import fs from "fs";
import path from "path";
import { EmailType } from "../../utils/emailContent.js";
import { sendMail } from "../emailService.js";
import { Report } from "../../models/reportModel.js";
import { Property } from "../../models/propertyModel.js";
import { PromotionRequest } from "../../models/promotionRequestModel.js";
import { AgentLicense, licenseStatus } from "../../models/agentLicenseModel.js";
import {
  createToken,
  createTokenPasswordReset,
} from "../../utils/tokenUtil.js";
import { dataRole } from "../../utils/dataUtil.js";
import { comparePassword, createPassword } from "../../utils/passwordUtil.js";
import config from "../../../config.js";

export class UserService {
  async register(data) {
    try {
      const password = data.password;
      const hashPassword = await createPassword(password);

      const userExists = await User.findOne({ email: data.email });
      if (userExists) {
        return "User already exists";
      }

      const wishlist = new Wishlist({
        items: [],
        total: 0,
      });

      if (data.password !== data.confirmPassword) {
        return "Passwords do not match";
      }

      const user = new User({
        name: data.name,
        email: data.email,
        password: hashPassword,
        role: roles.USER,
        wishlist: wishlist,
      });

      await user.save();
      await wishlist.save();

      const token = createToken(user);
      const userToken = {
        token: token.token,
      };
      //sendMail(EmailType.Welcome, user.email);
      return userToken;
    } catch (error) {
      throw new Error("Problem in the registration " + error);
    }
  }

  async login(data) {
    try {
      const user = await User.findOne({ email: data.email }).select(
        "+password"
      );

      if (!user) {
        // Return a structured error response
        return { error: true, message: "User not found", statusCode: 404 };
      }

      const passwordIsValid = await comparePassword(
        data.password,
        user.password
      );
      if (!passwordIsValid) {
        // Return a structured error response
        return { error: true, message: "Invalid password", statusCode: 401 };
      }

      const token = createToken(user, config.expiresIn);
      return { error: false, token: token.token }; // Success response
    } catch (error) {
      // Log the actual error for debugging
      console.error("Login error:", error);
      throw new Error("Problem in the login");
    }
  }

  async me(data) {
    try {
      const userId = data;
      const payload = dataRole(userId);
      return payload;
    } catch (error) {
      throw new Error("Problem in fetching user " + error);
    }
  }

  async forgotPassword(data) {
    try {
      // Verifica se o token foi passado
      if (data.token === undefined) {
        return "No token found";
      }

      // Encontra o usuário com o token de redefinição de senha
      const user = await User.findOne({ resetPasswordToken: data.token });

      // Se o usuário não for encontrado
      if (!user) {
        return "No user found with this token";
      }

      // Se o token de redefinição de senha for nulo
      if (user.resetPasswordToken === null) {
        return "No token found";
      }

      // Verifica a validade do token
      const verification = await tokenPasswordReset(user.resetPasswordToken);
      if (!verification) {
        return "Token expired";
      }

      const newPassword = data.newPassword;
      const confirmPassword = data.confirmPassword;

      // Verifica se as senhas são iguais
      if (newPassword !== confirmPassword) {
        return "Passwords do not match";
      }

      // Verifica se a nova senha é a mesma da antiga
      const oldPassword = await comparePassword(newPassword, user.password);
      if (oldPassword) {
        return "New password cannot be the same as the old password";
      }

      try {
        // Atualiza a senha
        user.password = await createPassword(newPassword);
        user.resetPasswordToken = undefined; // Limpa o token de redefinição de senha

        // Salva as alterações
        await user.save();
        return "Password updated successfully";
      } catch (err) {
        throw new Error("Problem in updating password " + err);
      }
    } catch (error) {
      throw new Error("Problem in forgot password " + error);
    }
  }

  async forgotPasswordToken(data) {
    try {
      const userEmail = data.email;
      const user = await User.findOne({ email: userEmail });
      user.resetPasswordToken = createTokenPasswordReset(user);
      await user.save();
      const token = {
        token: user.resetPasswordToken,
      };
      sendMail(EmailType.ResetPassword, user.email, token);
      return "Email sent successfully";
    } catch (error) {
      throw new Error("Problem in forgot password token " + error);
    }
  }

  async userById(data) {
    try {
      const userId = data;
      const payload = dataRole(userId);
      return payload;
    } catch (error) {
      throw new Error("Problem in fetching user " + error);
    }
  }

  async updateUser(data) {
    try {
      const {
        userId,
        email,
        phone,
        name,
        profilePaths,
        profileFiles,
        password,
        confirmPassword,
      } = data;

      const user = await User.findById(userId).lean(); // Use lean() para leitura sem overhead do Mongoose

      const profileImage = profilePaths?.profile
        ? profilePaths.profile[0]
        : null;

      let isUpdated = false;
      const updateMessages = [];
      const updates = {}; // Armazena apenas os campos a serem atualizados

      // Verifica e atualiza o campo de e-mail
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: userId },
        });

        if (existingUser) {
          updateMessages.push("Email is already in use by another user.");
        } else {
          updates.email = email;
          isUpdated = true;
          updateMessages.push("Email updated successfully.");
        }
      }

      // Verifica e atualiza o campo de telefone
      if (phone && phone !== user.phone) {
        const existingUser = await User.findOne({
          phone,
          _id: { $ne: userId },
        });

        if (existingUser) {
          updateMessages.push(
            "Phone number is already in use by another user."
          );
        } else {
          updates.phone = phone;
          isUpdated = true;
          updateMessages.push("Phone number updated successfully.");
        }
      }

      // Verifica e atualiza o campo de nome
      if (name && name !== user.name) {
        updates.name = name;
        isUpdated = true;
        updateMessages.push("Name updated successfully.");
      }

      // Verifica e atualiza o campo de imagem
      if (profileImage && profileImage !== user.image) {
        if (user.image) {
          // Remove a imagem antiga
          const oldImagePath = path.resolve(user.image); // Caminho completo da imagem antiga
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Failed to delete old profile image:", err);
            }
          });
        }

        if (user.image) {
          // Remove a imagem antiga
          const oldImagePath = path.resolve(user.image); // Caminho completo da imagem antiga
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Failed to delete old profile image:", err);
            } else {
              console.log("Old profile image deleted successfully.");
            }
          });
        }

        updates.image = profileImage;
        isUpdated = true;
        updateMessages.push("Profile image updated successfully.");
      }

      // Verifica e atualiza a senha
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          return "New password and confirmation do not match.";
        }
        const passwordIsValid = await comparePassword(
          data.currentPassword,
          user.password
        );

        if (!passwordIsValid) {
          return "Current password is incorrect";
        }
        const diferentPasswords = await comparePassword(
          confirmPassword,
          user.password
        );
        if (diferentPasswords) {
          return "New password cannot be the same as the old password";
        }

        updates.password = await createPassword(password);
        isUpdated = true;
        updateMessages.push("Password updated successfully.");
      }

      // Salva apenas se alguma atualização foi feita
      if (isUpdated) {
        await User.findByIdAndUpdate(userId, updates, { new: true });

        // Salva arquivos apenas se existirem
        if (profileFiles && profilePaths) {
          saveFilesToDisk(profileFiles, profilePaths);
        }

        return {
          success: true,
          message: "User updated successfully",
          details: updateMessages,
        };
      } else {
        return {
          success: false,
          message: "No changes detected, user not updated.",
          details: updateMessages,
        };
      }
    } catch (error) {
      throw new Error("Problem in updating user: " + error);
    }
  }

  async getAllAgents(data) {
    try {
      const totalAgents = await User.countDocuments({ role: roles.AGENT });
      const totalPages = Math.ceil(totalAgents / data.limit);
      // Verifica se a página solicitada é válida
      const page = Math.min(Math.max(data.page || 1, 1), totalPages || 1);
      const agents = await User.find({ role: roles.AGENT })
        .skip((page - 1) * data.limit)
        .limit(parseInt(data.limit));

      const agentData = agents.map((agent) => ({
        ...agent.toObject(),
      }));
      return {
        agentData,
        totalPages,
        page,
        totalAgents,
      };
    } catch (error) {
      throw new Error("Problem in fetching agents " + error);
    }
  }

  async getAgentsbyEnterprise(data) {
    try {
      const { agency, limit = 10, page = 1 } = data;

      if (!agency) {
        return "Enterprise not found";
      }

      // Calculate the skip value for pagination
      const skip = (page - 1) * limit;

      // Find users by agency with pagination
      const users = await User.find({ employer: agency })
        .skip(skip)
        .limit(limit);

      if (!users || users.length === 0) {
        return "No agents found for this enterprise";
      }

      // Get the total number of users for pagination metadata
      const totalAgents = await User.countDocuments({ employer: agency });
      const totalPages = Math.ceil(totalAgents / limit);

      return {
        agents: users,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      throw new Error(
        "Problem in fetching agents by enterprise: " + error.message
      );
    }
  }

  async deleteUser(data) {
    try {
      const userId = data;
      const user = await User.findById(userId);

      if (!user) {
        return "User  not found";
      }

      if (user.role === roles.AGENT) {
        const agentLicense = await AgentLicense.findOne({ holder: userId });
        if (agentLicense) {
          // Delete the agent's license
          await agentLicense.deleteOne();
        }

        const promotionRequest = await PromotionRequest.findOne({
          user: userId,
        });
        if (promotionRequest) await promotionRequest.deleteOne();

        const report = await Report.findOne({ agent: userId });
        if (report) {
          report.agent = user.email; // Assuming you want to keep the email for reference
          await report.save();
        }

        const properties = await Property.find({ agent: userId });
        for (const property of properties) {
          const files = [
            ...(Array.isArray(property.fotos) ? property.fotos : []),
            ...(Array.isArray(property.videos) ? property.videos : []),
            ...(Array.isArray(property.plants) ? property.plants : []),
          ];

          // Delete associated files
          for (const file of files) {
            try {
              const filePath = path.resolve(file); // Ensure the file path is resolved
              await deleteFile(filePath);
            } catch (err) {
              console.error(`Error deleting file ${file}:`, err.message);
            }
          }

          // Delete the property
          await Property.findByIdAndDelete(property._id);

          // Remove the property from wishlists
          await Wishlist.updateMany(
            { "items.property": property._id },
            { $pull: { items: { property: property._id } } }
          );

          // Delete reports associated with the property
          await Report.deleteMany({ property: property._id });
        }
      }

      const wishlist = await Wishlist.findOne({ user: userId });
      if (wishlist) {
        await wishlist.deleteOne();
      }

      if (user.image) {
        const files = Array.isArray(user.image) ? user.image : [user.image];
        for (const file of files) {
          try {
            const filePath = path.resolve(file); // Ensure the file path is resolved
            await deleteFile(filePath);
          } catch (err) {
            console.error(
              `Error deleting user image file ${file}:`,
              err.message
            );
          }
        }
      }

      // Finally, delete the user
      await User.findByIdAndDelete(userId);

      return "User , related properties, files, and associated data removed successfully";
    } catch (error) {
      throw new Error("Problem in deleting user: " + error.message);
    }
  }
}
