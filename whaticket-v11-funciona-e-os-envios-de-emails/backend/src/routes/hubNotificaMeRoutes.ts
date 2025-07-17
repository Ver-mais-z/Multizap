import express from "express";
import isAuth from "../middleware/isAuth"; // Autenticação do usuário
import * as HubNotificaMeController from "../controllers/HubNotificaMeController"; // Adaptado para o controlador de HubNotificaMe

const routes = express.Router();

// Rota para listar HubNotificaMe (apenas registros do usuário e empresa da sessão)
routes.get("/hub-notificame/list", isAuth, HubNotificaMeController.findList);

// Rota para criar um novo HubNotificaMe
routes.post("/hub-notificame", isAuth, HubNotificaMeController.store);

// Rota para atualizar um HubNotificaMe existente
routes.put("/hub-notificame/:id", isAuth, HubNotificaMeController.update);

// Rota para deletar um HubNotificaMe
routes.delete("/hub-notificame/:id", isAuth, HubNotificaMeController.remove);

export default routes;
