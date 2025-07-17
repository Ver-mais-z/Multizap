import fs from "fs";
import path from "path";
import { promisify } from "util";
import { proto, downloadMediaMessage } from "@whiskeysockets/baileys";
import { getWbot } from "../../libs/wbot";

const writeFileAsync = promisify(fs.writeFile);

interface Request {
  msg: proto.IWebMessageInfo;
  quotedMessage: any;
  companyId: number;
}

const DownloadStatusMediaService = async ({
  msg,
  quotedMessage,
  companyId
}: Request): Promise<{
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaType: string;
  mediaCaption?: string;
  mimetype?: string;
}> => {
  try {
    const wbot = getWbot(Number(msg.key.remoteJid.split("@")[0]));
    
    let mediaType = 'text';
    let mediaUrl = '';
    let mediaThumbnail = '';
    let mediaCaption = '';
    let mimetype = '';

    // Processar imagem
    if (quotedMessage?.imageMessage) {
      mediaType = 'image';
      mediaCaption = quotedMessage.imageMessage.caption || '';
      mimetype = quotedMessage.imageMessage.mimetype || 'image/jpeg';

      try {
        const stream = await downloadMediaMessage(
          { key: msg.key, message: { imageMessage: quotedMessage.imageMessage } } as any,
          "buffer",
          {},
          {
            logger: wbot.logger, // Ensure wbot.logger is a valid Logger instance
            reuploadRequest: wbot.updateMediaMessage
          }
        );

        if (stream) {
          const filename = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const publicFolder = path.join(__dirname, "..", "..", "..", "public", "company" + companyId);
          
          if (!fs.existsSync(publicFolder)) {
            fs.mkdirSync(publicFolder, { recursive: true });
          }

          const filePath = path.join(publicFolder, filename);
          await writeFileAsync(filePath, stream);
          
          mediaUrl = `${process.env.BACKEND_URL}/public/company${companyId}/${filename}`;
          mediaThumbnail = mediaUrl; // Para imagens, thumbnail é a mesma URL
        }
      } catch (error) {
        console.log("Erro ao baixar imagem do status:", error);
      }
    }

    // Processar vídeo
    if (quotedMessage?.videoMessage) {
        const stream = await downloadMediaMessage(
          { key: msg.key, message: { videoMessage: quotedMessage.videoMessage } } as any,
          "buffer",
          {},
          {
            logger: wbot.logger,
            reuploadRequest: wbot.updateMediaMessage
          }
        );
      try {
        const stream = await downloadMediaMessage(
          { key: msg.key, message: { videoMessage: quotedMessage.videoMessage } } as any,
          "buffer",
          {}
        );

        if (stream) {
          const filename = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`;
          const publicFolder = path.join(__dirname, "..", "..", "..", "public", "company" + companyId);
          
          if (!fs.existsSync(publicFolder)) {
            fs.mkdirSync(publicFolder, { recursive: true });
          }

          const filePath = path.join(publicFolder, filename);
          await writeFileAsync(filePath, stream);
          
          mediaUrl = `${process.env.BACKEND_URL}/public/company${companyId}/${filename}`;
          
          // Para vídeos, usar thumbnail se disponível
          if (quotedMessage.videoMessage.jpegThumbnail) {
            const thumbFilename = `thumb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
            const thumbPath = path.join(publicFolder, thumbFilename);
            await writeFileAsync(thumbPath, quotedMessage.videoMessage.jpegThumbnail);
            mediaThumbnail = `${process.env.BACKEND_URL}/public/company${companyId}/${thumbFilename}`;
          }
        }
      } catch (error) {
        console.log("Erro ao baixar vídeo do status:", error);
      }
    }

    return {
      mediaUrl,
      mediaThumbnail,
      mediaType,
      mediaCaption,
      mimetype
    };

  } catch (error) {
    console.log("Erro no DownloadStatusMediaService:", error);
    return {
      mediaType: 'text'
    };
  }
};

export default DownloadStatusMediaService;