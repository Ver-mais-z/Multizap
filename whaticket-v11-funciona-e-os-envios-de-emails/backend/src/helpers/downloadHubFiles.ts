import axios from "axios";
import { extname, join, basename } from "path";
import { writeFile } from "fs/promises";
import * as fs from "fs";
import mime from "mime-types";
import sizeOf from "image-size";

export const downloadFiles = async (url: string, companyId: number, mediaType: string = "unknown") => {
  try {
    // Faz uma requisição HEAD para pegar o Content-Type real da URL
    const headResponse = await axios.head(url);
    const realContentType = headResponse.headers["content-type"] || "application/octet-stream";

    // Baixa o arquivo
    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });

    // Obtém o nome do arquivo da URL
    const originalname = basename(new URL(url).pathname);
    let extension = extname(originalname); // Extensão original (pode estar vazia)
    let mimeType = realContentType; // Usa o Content-Type real como base
    let filename;

    // Ajusta o mimeType e a extensão com base no Content-Type e no mediaType do webhook
    if (mimeType === "video/mp4" && mediaType === "audio") {
      // Instagram: arquivo é um áudio disfarçado de video/mp4
      mimeType = "audio/mpeg";
      extension = ".mp3";
      filename = `${Date.now()}${extension}`;
    } else if (mimeType === "video/mp4") {
      // Instagram ou outros: arquivo é um vídeo de verdade
      mimeType = "video/mp4";
      extension = ".mp4";
      filename = `${Date.now()}${extension}`;
    } else if (mimeType.startsWith("audio/")) {
      // Outros áudios legítimos
      mimeType = "audio/mpeg";
      extension = extension || ".mp3";
      filename = `${Date.now()}${extension}`;
    } else if (mimeType.startsWith("video/")) {
      // Outros vídeos legítimos
      mimeType = "video/mp4";
      extension = extension || ".mp4";
      filename = `${Date.now()}${extension}`;
    } else if (mimeType.startsWith("image/")) {
      // Imagens
      try {
        const dimensions = sizeOf(data);
        if (dimensions.type === "jpeg") {
          mimeType = "image/jpeg";
          extension = ".jpg";
        } else if (dimensions.type === "png") {
          mimeType = "image/png";
          extension = ".png";
        } else {
          mimeType = "image/jpeg"; // Fallback para imagem
          extension = ".jpg";
        }
        filename = `${Date.now()}${extension}`;
      } catch (error) {
        console.warn("Erro ao identificar imagem:", error.message);
        mimeType = "image/jpeg"; // Fallback seguro
        extension = ".jpg";
        filename = `${Date.now()}${extension}`;
      }
    } else {
      // Fallback para outros tipos
      mimeType = mime.lookup(originalname) || "application/octet-stream";
      extension = extension || ".bin";
      filename = `${Date.now()}${extension}`;
    }

    // Caminho da pasta public com companyId
    const publicPath = join(__dirname, "..", "..", "public", `company${companyId}`);
    const filePath = join(publicPath, filename);

    // Cria o diretório da empresa se não existir
    await fs.promises.mkdir(publicPath, { recursive: true });

    // Salva o arquivo
    await writeFile(filePath, data);

    // Retorna os dados do arquivo
    return {
      mimeType,
      extension,
      filename,
      filePath,
      originalname,
    };
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    throw error;
  }
};