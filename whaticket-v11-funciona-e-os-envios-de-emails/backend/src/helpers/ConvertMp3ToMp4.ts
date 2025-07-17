
/*import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";*/
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime-types";
import ffmpegPath from "ffmpeg-static";

// CONVERTER MP3 PARA MP4
const convertMp3ToMp4 = (input: string, outputMP4: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath);

    if (!fs.existsSync(input)) {
      const errorMsg = `Input file does not exist: ${input}`;
      console.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    ffmpeg(input)
      .inputFormat("mp3")  // Pode remover ou verificar se necessário
      .output(outputMP4)
      .outputFormat("mp4")
      .on("start", (commandLine) => {
        console.log(`FFmpeg command: ${commandLine}`);
      })
      .on("error", (error: Error) => {
        console.error("Error during conversion:", error);
        reject(error);
      })
      .on("progress", (progress) => {
        console.log(`Processing... ${progress.percent}% complete`);
      })
      .on("end", () => {
        console.log("Transcoding succeeded !");
        resolve();
      })
      .run();
  });
};

export { convertMp3ToMp4 };