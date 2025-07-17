import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import User from "../models/User";
import Company from "../models/Company";
import { SendMail } from "../helpers/SendMail";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email }: ForgotPasswordData = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
  });

  try {
    await schema.validate({ email });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: Company, as: "company" }]
  });

  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Gerar token de reset
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token válido por 1 hora

  // Salvar token no usuário
  await user.update({
    resetToken,
    resetTokenExpiry
  });

  // Enviar email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const emailData = {
    to: email,
    subject: `Redefinição de senha - ${user.company.name}`,
    text: `
      <h2>Redefinição de senha</h2>
      <p>Olá ${user.name},</p>
      <p>Você solicitou a redefinição de sua senha.</p>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}" target="_blank" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 10px 0;
      ">Redefinir Senha</a>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p>${resetUrl}</p>
      <p>Este link é válido por 1 hora.</p>
      <p>Se você não solicitou esta redefinição, ignore este email.</p>
      <br>
      <p>Atenciosamente,<br>Equipe ${user.company.name}</p>
    `
  };

  try {
    await SendMail(emailData);
  } catch (error) {
    console.log('Erro ao enviar email de reset:', error);
    throw new AppError("ERR_SENDING_EMAIL", 500);
  }

  return res.status(200).json({ message: "Email de redefinição enviado com sucesso!" });
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token, password }: ResetPasswordData = req.body;

  const schema = Yup.object().shape({
    token: Yup.string().required(),
    password: Yup.string().min(6).required(),
  });

  try {
    await schema.validate({ token, password });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const user = await User.findOne({
    where: { 
      resetToken: token,
      resetTokenExpiry: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new AppError("ERR_INVALID_RESET_TOKEN", 400);
  }

  // Hash da nova senha
  const saltRounds = 8;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Atualizar senha e limpar token
  await user.update({
    passwordHash: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null
  });

  return res.status(200).json({ message: "Senha redefinida com sucesso!" });
};

export const validateResetToken = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { 
      resetToken: token,
      resetTokenExpiry: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new AppError("ERR_INVALID_RESET_TOKEN", 400);
  }

  return res.status(200).json({ valid: true, email: user.email });
};