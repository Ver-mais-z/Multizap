require("dotenv").config();
const { Client, FileContent } = require("notificamehubsdk");
const ffmpeg = require("fluent-ffmpeg");
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { convertMp3ToMp4 } from "../../helpers/ConvertMp3ToMp4";
import * as fs from "fs";
import { join } from "path";

export const SendMediaMessageService = async (
  media: Express.Multer.File,
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any,
  companyIdOld: number
) => {
  const ticket = await Ticket.findOne({ where: { id: ticketId } });
  if (!ticket) {
    throw new Error("Ticket não encontrado");
  }

  const companyId = ticket.companyId;
  const notificameHubToken = await showHubToken();
  const client = new Client(notificameHubToken);

  let channelClient;
  let contactNumber;
  let type;
  let mediaUrl;

  if (contact.messengerId && !contact.instagramId) {
    contactNumber = contact.messengerId;
    type = "facebook";
    channelClient = client.setChannel(type);
  }
  if (!contact.messengerId && contact.instagramId) {
    contactNumber = contact.instagramId;
    type = "instagram";
    channelClient = client.setChannel(type);
  }

  message = message.replace(/\n/g, " ");
  const backendUrl = `${process.env.BACKEND_URL}`;
  const filename = encodeURIComponent(media.filename);
  mediaUrl = `${backendUrl}/public/company${companyId}/${filename}`;

  // Função para converter vídeo MP4 para formato compatível
  const convertVideoToCompatibleFormat = async (inputPath: string, destination: string) => {
    const outputFilename = `${Date.now()}.mp4`;
    const outputPath = join(destination, outputFilename);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec("libx264") // H.264
        .audioCodec("aac")     // AAC
        .outputOptions([
          "-profile:v baseline", // Perfil Baseline para compatibilidade
          "-level 3.0",         // Nível 3.0
          "-movflags +faststart" // Metadados no início
        ])
        .size("854x480")       
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    return outputFilename;
  };

  // Ajuste para vídeos MP4 (Facebook e Instagram)
  if (media.mimetype.includes("video") && (type === "facebook" || type === "instagram")) {
    try {
      const inputPath = media.path;
      const convertedFilename = await convertVideoToCompatibleFormat(inputPath, media.destination);
      media.filename = convertedFilename;
      mediaUrl = `${backendUrl}/public/company${companyId}/${convertedFilename}`;
      media.originalname = convertedFilename;
      media.mimetype = "video"; // Define como "video" para ambos
    } catch (error) {
      console.error(`Erro ao converter vídeo para ${type}:`, error);
    }
  } else if (media.mimetype.includes("image")) {
    if (type === "telegram") {
      media.mimetype = "photo";
    } else {
      media.mimetype = "image";
    }
  } else if (
    (type === "telegram" || type === "facebook") &&
    media.mimetype.includes("audio")
  ) {
    media.mimetype = "audio";
  } else if (type === "telegram" || type === "facebook") {
    media.mimetype = "file";
  }

  // Conversão de MP3 para Instagram (mantida)
  if (media.originalname.includes(".mp3") && type === "instagram") {
    const inputPath = media.path;
    const outputMP4Path = `${media.destination}/${media.filename.split(".")[0]}.mp4`;
    try {
      await convertMp3ToMp4(inputPath, outputMP4Path);
      media.filename = outputMP4Path.split("/").pop() ?? "default.mp4";
      mediaUrl = `${backendUrl}/public/company${companyId}/${media.filename}`;
      media.originalname = media.filename;
      media.mimetype = "audio";
    } catch (e) {
      console.error("Erro ao converter MP3 para Instagram:", e);
    }
  }

  // Para MP3 no Facebook (mantida)
  if (media.originalname.includes(".mp3") && type === "facebook") {
    mediaUrl = `${backendUrl}/public/company${companyId}/${media.filename}`;
    media.originalname = media.filename;
    media.mimetype = "audio";
  }

  const content = new FileContent(
    mediaUrl,
    media.mimetype,
    media.originalname,
    media.originalname
  );

  console.log({
    token: connection.qrcode,
    number: contactNumber,
    content,
    message,
    companyId
  });

  try {
    let response = await channelClient.sendMessage(
      connection.qrcode,
      contactNumber,
      content
    );
    console.log("response:", response);

    let data: any;
    try {
      const jsonStart = response.indexOf("{");
      const jsonResponse = response.substring(jsonStart);
      data = JSON.parse(jsonResponse);
    } catch (error) {
      data = response;
    }

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      companyId,
      body: message,
      ticketId,
      fromMe: true,
      fileName: `${media.filename}`,
      mediaType: media.mimetype.split("/")[0],
      originalName: media.originalname
    });

    return newMessage;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};