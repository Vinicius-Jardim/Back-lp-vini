import mongoose from "mongoose";
import { User, roles } from "../models/usersModel.js";
import fs from "fs";
import { Property, type } from "../models/propertyModel.js";

export const validID = (ObjectId) => {
  const isValid = mongoose.Types.ObjectId.isValid(ObjectId);
  return isValid;
};

export const dataRole = async (id) => {
  const user = await User.findById(id);
  try {
    if (roles.CLIENT === user.role) {
      const data = {
        id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
      return data;
    } else if (roles.AGENT === user.role) {
      const data = {
        id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentLicense: user.agentLicense,
        employer: user.employer,
      };
      return data;
    } else if (roles.ADMIN === user.role) {
      const data = {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        role: user.role,
        agentLicense: user.agentLicense,
        employer: user.employer,
      };
      return data;
    }
  } catch (error) {
    throw new Error("Problem in the dataRole " + error);
  }
};

export const createProperty = async (data) => {
  try {
    if (!Object.values(type).includes(data.type)) {
      return "Invalid type";
    }
    if (!validID(data.agent)) {
      return "Invalid agent";
    }
    if (data.type === type.LAND) {
      delete data.bedrooms;
      delete data.bathrooms;
    }

    data.agent = data.agent;
    const property = new Property({ ...data, agent: data.agent });
    await property.save();
    return property;
  } catch (error) {
    throw new Error("Problem in the createProperty " + error);
  }
};

export const isImage = (files) => {
  const imageExtensions = [".jpg", ".jpeg", ".png"];

  // Se `files` for um array, verificamos cada item individualmente
  if (Array.isArray(files)) {
    return files.every(
      (file) =>
        file &&
        typeof file === "string" &&
        imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );
  }

  // Caso contrário, aplicamos a verificação em um único arquivo
  return (
    files &&
    typeof files === "string" &&
    imageExtensions.some((ext) => files.toLowerCase().endsWith(ext))
  );
};

export const isVideo = (files) => {
  const videoExtensions = [".mp4", ".mov"];

  if (Array.isArray(files)) {
    return files.every(
      (file) =>
        file &&
        typeof file === "string" &&
        videoExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );
  }

  return (
    files &&
    typeof files === "string" &&
    videoExtensions.some((ext) => files.toLowerCase().endsWith(ext))
  );
};
// Função para deletar um arquivo com segurança
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const fileExists = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};
