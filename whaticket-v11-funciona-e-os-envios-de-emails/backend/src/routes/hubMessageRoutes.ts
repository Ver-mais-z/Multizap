import express from "express";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";
import multer from "multer";

import * as MessageController from "../controllers/MessageHubController";

const hubMessageRoutes = express.Router();
const upload = multer(uploadConfig);

hubMessageRoutes.post("/hub-message/:ticketId",isAuth,upload.array("medias"),MessageController.send);
hubMessageRoutes.post("/hub-ticket", isAuth, MessageController.store);

export default hubMessageRoutes;