import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.post("/messages/:ticketId", isAuth, upload.array("medias"), MessageController.store);
// Nova rota para transcrição
messageRoutes.get("/messages/transcribeAudio/:fileName", isAuth, MessageController.transcribeAudioMessage);
// messageRoutes.post("/forwardmessage",isAuth,MessageController.forwardmessage);
messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);
messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);
// Compatível com o frontend: POST /messages/:messageId/react
messageRoutes.post('/messages/:messageId/react', isAuth, MessageController.addReaction);
// Rota antiga (pode remover se não for mais usada)
// messageRoutes.post('/messages/:messageId/reactions', isAuth, MessageController.addReaction);
messageRoutes.get("/messages-allMe", isAuth, MessageController.allMe);
messageRoutes.post('/message/forward', isAuth, MessageController.forwardMessage)

export default messageRoutes;
