import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { emailContent } from "../utils/emailContent.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Host correto
  port: 587, // Porta SMTP do Gmail
  secure: false, // false para STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // Variável de ambiente com o e-mail
    pass: process.env.EMAIL_PASSWORD, // Senha de aplicativo do Gmail
  },
  authMethod: "PLAIN", // Força o uso do método PLAIN para a autenticação
});

// Função para enviar e-mail
function sendMail(emailType, to, token) {
  return new Promise((resolve, reject) => {
    const emailInfo = emailContent[emailType];
    if (!emailInfo) {
      return reject(new Error("Invalid email type provided."));
    }

    let html =
      typeof emailInfo.html === "function"
        ? emailInfo.html(token || "")
        : emailInfo.html || "";

    const mailOptions = {
      to,
      subject: emailInfo.subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(new Error(`Failed to send email: ${error.message}`));
      } else {
        resolve({ message: "Email sent successfully.", info });
      }
    });
  });
}

export { sendMail };
