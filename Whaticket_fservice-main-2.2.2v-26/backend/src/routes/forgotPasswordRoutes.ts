import express from "express";
import * as ForgotPasswordController from "../controllers/ForgotPasswordController";

const forgotPasswordRoutes = express.Router();

forgotPasswordRoutes.post("/forgot-password", ForgotPasswordController.forgotPassword);
forgotPasswordRoutes.post("/reset-password", ForgotPasswordController.resetPassword);
forgotPasswordRoutes.get("/validate-reset-token/:token", ForgotPasswordController.validateResetToken);

export default forgotPasswordRoutes;