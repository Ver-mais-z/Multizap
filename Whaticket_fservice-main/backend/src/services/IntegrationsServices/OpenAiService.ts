import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys";
import {
  convertTextToSpeechAndSaveToFile,
  getBodyMessage,
  keepOnlySpecifiedChars,
  transferQueue,
  verifyMediaMessage,
  verifyMessage,
} from "../WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  queueId: number;
  maxMessages: number;
  model: string;
  openAiApiKey?: string;
}

interface SessionOpenAi extends OpenAI {
  id?: number;
}

interface SessionGemini extends GoogleGenerativeAI {
  id?: number;
}

// Cache for AI sessions
const sessionsOpenAi: SessionOpenAi[] = [];
const sessionsGemini: SessionGemini[] = [];

/**
 * Safely deletes a file from the filesystem
 */
const deleteFileSync = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

/**
 * Sanitizes a contact name for use in prompts
 */
const sanitizeName = (name: string): string => {
  if (!name) return "Cliente";
  
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60) || "Cliente";
};

/**
 * Prepares conversation history for AI models
 */
const prepareMessagesAI = (pastMessages: Message[], isGeminiModel: boolean, promptSystem: string): any[] => {
  const messagesAI = [];

  // Add system prompt for OpenAI
  if (!isGeminiModel) {
    messagesAI.push({ role: "system", content: promptSystem });
  }

  // Add conversation history
  for (const message of pastMessages) {
    if (message.mediaType === "conversation" || message.mediaType === "extendedTextMessage") {
      if (message.fromMe) {
        messagesAI.push({ role: "assistant", content: message.body });
      } else {
        messagesAI.push({ role: "user", content: message.body });
      }
    }
  }

  return messagesAI;
};

/**
 * Process and send AI response (text or audio)
 */
const processResponse = async (
  responseText: string,
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  openAiSettings: IOpenAi,
  ticketTraking: TicketTraking
): Promise<void> => {
  let response = responseText?.trim();
  if (!response) {
    console.warn("Empty response from AI");
    response = "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.";
  }

  // Check for transfer action trigger
  if (response.toLowerCase().includes("ação: transferir para o setor de atendimento")) {
    await transferQueue(openAiSettings.queueId, ticket, contact);
    response = response.replace(/ação: transferir para o setor de atendimento/i, "").trim();
  }

  const publicFolder: string = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);

  // Send response based on preferred format (text or voice)
  if (openAiSettings.voice === "texto") {
    const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
      text: `\u200e ${response}`,
    });
    await verifyMessage(sentMessage!, ticket, contact);
  } else {
    const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
    try {
      await convertTextToSpeechAndSaveToFile(
        keepOnlySpecifiedChars(response),
        `${publicFolder}/${fileNameWithOutExtension}`,
        openAiSettings.voiceKey,
        openAiSettings.voiceRegion,
        openAiSettings.voice,
        "mp3"
      );
      
      const audioPath = `${publicFolder}/${fileNameWithOutExtension}.mp3`;
      if (fs.existsSync(audioPath)) {
        const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          audio: { url: audioPath },
          mimetype: "audio/mpeg",
          ptt: true,
        });
        await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false, false, wbot);
      } else {
        throw new Error("Audio file was not created successfully");
      }
      
      // Cleanup files
      deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
      deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
    } catch (error) {
      console.error(`Error responding with audio: ${error}`);
      // Fallback to text response
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: `\u200e ${response}`,
      });
      await verifyMessage(sentMessage!, ticket, contact);
    }
  }
};

/**
 * Handle OpenAI request
 */
const handleOpenAIRequest = async (
  openai: SessionOpenAi, 
  messagesAI: any[], 
  openAiSettings: IOpenAi
): Promise<string> => {
  try {
    const chat = await openai.chat.completions.create({
      model: openAiSettings.model,
      messages: messagesAI,
      max_tokens: openAiSettings.maxTokens,
      temperature: openAiSettings.temperature,
    });
    return chat.choices[0].message?.content || "";
  } catch (error) {
    console.error("OpenAI request error:", error);
    throw error;
  }
};

/**
 * Handle Gemini request
 */
const handleGeminiRequest = async (
  gemini: SessionGemini,
  messagesAI: any[],
  openAiSettings: IOpenAi,
  bodyMessage: string,
  promptSystem: string
): Promise<string> => {
  try {
    const model = gemini.getGenerativeModel({
      model: openAiSettings.model,
      systemInstruction: promptSystem,
    });

    // Map messages to Gemini format
    const geminiHistory = messagesAI.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(bodyMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini request error:", error);
    throw error;
  }
};

/**
 * Process audio file and get transcription
 */
const processAudioFile = async (
  audioFilePath: string,
  openai: SessionOpenAi | null,
  gemini: SessionGemini | null,
  isOpenAIModel: boolean,
  isGeminiModel: boolean,
  promptSystem: string
): Promise<string | null> => {
  if (!fs.existsSync(audioFilePath)) {
    console.error(`Audio file not found: ${audioFilePath}`);
    return null;
  }

  try {
    if (isOpenAIModel && openai) {
      const file = fs.createReadStream(audioFilePath) as any;
      const transcriptionResult = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: file,
      });
      return transcriptionResult.text || null;
    } 
    else if (isGeminiModel && gemini) {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-pro",  // Using pro model for transcription
        systemInstruction: promptSystem,
      });

      const audioFileBase64 = fs.readFileSync(audioFilePath, { encoding: 'base64' });
      const fileExtension = path.extname(audioFilePath).toLowerCase();
      let mimeType = 'audio/mp3';
      switch (fileExtension) {
        case '.wav': mimeType = 'audio/wav'; break;
        case '.mp3': mimeType = 'audio/mp3'; break;
        case '.aac': mimeType = 'audio/aac'; break;
        case '.ogg': mimeType = 'audio/ogg'; break;
        case '.flac': mimeType = 'audio/flac'; break;
        case '.aiff': mimeType = 'audio/aiff'; break;
      }

      const transcriptionRequest = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Gere uma transcrição precisa deste áudio." },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: audioFileBase64,
                },
              },
            ],
          },
        ],
      });

      return transcriptionRequest.response.text() || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
};

/**
 * Create or retrieve AI session for ticket
 */
const getAISession = (
  ticket: Ticket, 
  isOpenAIModel: boolean, 
  isGeminiModel: boolean, 
  openAiSettings: IOpenAi
): { openai: SessionOpenAi | null, gemini: SessionGemini | null } => {
  let openai: SessionOpenAi | null = null;
  let gemini: SessionGemini | null = null;

  // Initialize OpenAI if needed
  if (isOpenAIModel) {
    const openAiIndex = sessionsOpenAi.findIndex(s => s.id === ticket.id);
    if (openAiIndex === -1) {
      openai = new OpenAI({ apiKey: openAiSettings.apiKey }) as SessionOpenAi;
      openai.id = ticket.id;
      sessionsOpenAi.push(openai);
    } else {
      openai = sessionsOpenAi[openAiIndex];
    }
  } 
  // Initialize Gemini if needed
  else if (isGeminiModel) {
    const geminiIndex = sessionsGemini.findIndex(s => s.id === ticket.id);
    if (geminiIndex === -1) {
      gemini = new GoogleGenerativeAI(openAiSettings.apiKey) as SessionGemini;
      gemini.id = ticket.id;
      sessionsGemini.push(gemini);
    } else {
      gemini = sessionsGemini[geminiIndex];
    }
  }

  // Initialize OpenAI for transcription if needed
  if (openAiSettings.openAiApiKey && !openai) {
    const openAiIndex = sessionsOpenAi.findIndex(s => s.id === ticket.id);
    if (openAiIndex === -1) {
      openai = new OpenAI({ apiKey: openAiSettings.openAiApiKey || openAiSettings.apiKey }) as SessionOpenAi;
      openai.id = ticket.id;
      sessionsOpenAi.push(openai);
    } else {
      openai = sessionsOpenAi[openAiIndex];
    }
  }

  return { openai, gemini };
};

/**
 * Main function to handle AI interactions
 */
export const handleOpenAi = async (
  openAiSettings: IOpenAi,
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  mediaSent: Message | undefined,
  ticketTraking: TicketTraking
): Promise<void> => {
  // Skip processing if bot is disabled for this contact
  if (contact.disableBot) {
    return;
  }

  // Get message body or check for audio
  const bodyMessage = getBodyMessage(msg);
  if (!bodyMessage && !msg.message?.audioMessage) return;

  // Skip if no settings or is a message stub
  if (!openAiSettings || msg.messageStubType) return;

  const publicFolder: string = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);

  // Determine model type
  const isOpenAIModel = ["gpt-3.5-turbo-1106", "gpt-4o"].includes(openAiSettings.model);
  const isGeminiModel = ["gemini-2.0-pro", "gemini-2.0-flash"].includes(openAiSettings.model);

  if (!isOpenAIModel && !isGeminiModel) {
    console.error(`Unsupported model: ${openAiSettings.model}`);
    return;
  }

  // Get AI session
  const { openai, gemini } = getAISession(ticket, isOpenAIModel, isGeminiModel, openAiSettings);

  // Fetch conversation history
  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: openAiSettings.maxMessages,
  });

  // Create personalized prompt
  const clientName = sanitizeName(contact.name || "");
  const promptSystem = `Instruções do Sistema:
  - Você é um assistente de atendimento ao cliente especializado,Seu nome é Ignus representando a empresa.
  - Responda sempre com o nome do cliente: ${clientName} nas respostas para um atendimento personalizado e acolhedor.
  - Mantenha respostas concisas com no máximo ${openAiSettings.maxTokens} tokens e termine de forma completa.
  - Sempre mencione o nome do cliente quando possível. Se não souber o nome, pergunte gentilmente.
  - Mantenha um tom cordial, profissional e amigável em todas as interações.
  - Para transferir para atendimento humano, comece a resposta com 'Ação: Transferir para o setor de atendimento'.
  
  Prompt Específico:
  ${openAiSettings.prompt}
  
  Siga estas instruções cuidadosamente para garantir um atendimento de qualidade.`;

  // Handle text message
  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
    try {
      const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);
      
      // Add current message to conversation
      messagesAI.push({ role: "user", content: bodyMessage! });
      
      let responseText: string | null = null;

      // Get response from appropriate AI model
      if (isOpenAIModel && openai) {
        responseText = await handleOpenAIRequest(openai, messagesAI, openAiSettings);
      } else if (isGeminiModel && gemini) {
        responseText = await handleGeminiRequest(gemini, messagesAI, openAiSettings, bodyMessage!, promptSystem);
      }

      if (!responseText) {
        console.error("No response received from AI provider");
        return;
      }

      // Process and send the response
      await processResponse(responseText, wbot, msg, ticket, contact, openAiSettings, ticketTraking);
    } catch (error) {
      console.error("AI request failed:", error);
      const errorMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, estou com dificuldades técnicas para processar sua solicitação no momento. Por favor, tente novamente mais tarde.",
      });
      await verifyMessage(errorMessage!, ticket, contact);
    }
  }
  // Handle audio message
  else if (msg.message?.audioMessage && mediaSent) {
    try {
      const mediaUrl = mediaSent.mediaUrl!.split("/").pop();
      const audioFilePath = `${publicFolder}/${mediaUrl}`;

      // Process audio and get transcription
      const transcription = await processAudioFile(
        audioFilePath, 
        openai, 
        gemini, 
        isOpenAIModel, 
        isGeminiModel,
        promptSystem
      );

      if (!transcription) {
        const noTranscriptMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: "Desculpe, não consegui entender o áudio. Por favor, tente novamente ou envie uma mensagem de texto.",
        });
        await verifyMessage(noTranscriptMessage!, ticket, contact);
        return;
      }

      // Send transcription confirmation
      const transcriptMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: `🎤 *Sua mensagem de voz:* ${transcription}`,
      });
      await verifyMessage(transcriptMessage!, ticket, contact);

      // Prepare conversation for AI response
      const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);
      messagesAI.push({ role: "user", content: transcription });
      
      let responseText: string | null = null;

      // Get response from appropriate AI model
      if (isOpenAIModel && openai) {
        responseText = await handleOpenAIRequest(openai, messagesAI, openAiSettings);
      } else if (isGeminiModel && gemini) {
        responseText = await handleGeminiRequest(gemini, messagesAI, openAiSettings, transcription, promptSystem);
      }

      if (!responseText) {
        console.error("No response received from AI provider");
        return;
      }

      // Process and send the response
      await processResponse(responseText, wbot, msg, ticket, contact, openAiSettings, ticketTraking);
    } catch (error) {
      console.error("Audio processing error:", error);
      const errorMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, houve um erro ao processar sua mensagem de áudio. Por favor, tente novamente ou envie uma mensagem de texto.",
      });
      await verifyMessage(errorMessage!, ticket, contact);
    }
  }
};