import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListService from "../services/HubNotificaMeService/ListService";
import CreateService from "../services/HubNotificaMeService/CreateService";
import ShowService from "../services/HubNotificaMeService/ShowService";
import UpdateService from "../services/HubNotificaMeService/UpdateService";
import DeleteService from "../services/HubNotificaMeService/DeleteService";
import FindService from "../services/HubNotificaMeService/FindService";

import HubNotificaMe from "../models/HubNotificaMe";

import { head } from "lodash";
import fs from "fs";
import path from "path";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreData = {
  nome: string;
  token: string;
  tipo: string;
};

type FindParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId }  = req.user;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  // Certifique-se de que o tipo foi fornecido
  const schema = Yup.object().shape({
    nome: Yup.string().required(),
    token: Yup.string().required(),
    tipo: Yup.string().oneOf(["Facebook", "Instagram"], "Tipo inválido").required("Tipo é obrigatório"), // Validação do tipo
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-hubnotificame`, {
    action: "create",
    record
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    nome: Yup.string().required(),
    token: Yup.string().required(),
    tipo: Yup.string().oneOf(["Facebook", "Instagram"], "Tipo inválido").required("Tipo é obrigatório"), // Validação do tipo
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const record = await UpdateService({
    ...data,
    id,
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-hubnotificame`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-hubnotificame`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: HubNotificaMe[] = await FindService(params);

  return res.status(200).json(records);
};
