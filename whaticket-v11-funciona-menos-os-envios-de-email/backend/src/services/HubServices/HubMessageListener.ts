import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { downloadFiles } from "../../helpers/downloadHubFiles";
import CreateMessageService from "./CreateHubMessageService";
/*import CreateOrUpdateTicketService from "./CreateOrUpdateHubTicketService";*/
import FindOrCreateContactService from "./FindOrCreateHubContactService";
import { UpdateMessageAck } from "./UpdateMessageHubAck";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getIO } from "../../libs/socket";

export interface HubInMessage {
  type: "MESSAGE";
  id: string;
  timestamp: string;
  subscriptionId: string;
  channel: "telegram" | "whatsapp" | "facebook" | "instagram" | "sms" | "email";
  direction: "IN";
  message: {
    id: string;
    from: string;
    to: string;
    direction: "IN";
    channel:
      | "telegram"
      | "whatsapp"
      | "facebook"
      | "instagram"
      | "sms"
      | "email";
    visitor: {
      name: string;
      firstName: string;
      lastName: string;
      picture: string;
    };
    contents: IContent[];
    timestamp: string;
  };
}

export interface IContent {
  type: "text" | "image" | "audio" | "video" | "file" | "location";
  text?: string;
  url?: string;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  filename?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface HubConfirmationSentMessage {
  type: "MESSAGE_STATUS";
  timestamp: string;
  subscriptionId: string;
  channel: "telegram" | "whatsapp" | "facebook" | "instagram" | "sms" | "email";
  messageId: string;
  contentIndex: number;
  messageStatus: {
    timestamp: string;
    code: "SENT" | "REJECTED";
    description: string;
  };
}

const verifySentMessageStatus = (message: HubConfirmationSentMessage) => {
  const {
    messageStatus: { code }
  } = message;

  const isMessageSent = code === "SENT";

  if (isMessageSent) {
    return true;
  }

  return false;
};

const HubMessageListener = async (
  message: any | HubInMessage | HubConfirmationSentMessage,
  whatsapp: Whatsapp,
  medias: Express.Multer.File[]
) => {
  console.log("HubMessageListener", message);
  console.log("contents", message.message.contents);

  // Se a mensagem for enviada de fora do sistema (OUT), ignoramos
  const ignoreEvent = message.direction === "OUT";
  if (ignoreEvent) {
    return;
  }

  const isMessageFromMe = message.type === "MESSAGE_STATUS";

  if (isMessageFromMe) {
    const isMessageSent = verifySentMessageStatus(
      message as HubConfirmationSentMessage
    );

    if (isMessageSent) {
      console.log("HubMessageListener: message sent");
      UpdateMessageAck(message.messageId);
    } else {
      console.log(
        "HubMessageListener: message not sent",
        message.messageStatus.code,
        message.messageStatus.description
      );
    }

    return;
  }

  // Desestruturando os dados da mensagem recebida
  const {
    message: { id, from, channel, contents, visitor }
  } = message as HubInMessage;

  try {

    const unreadMessages = 1;
    
    // Passando whatsapp.companyId diretamente para FindOrCreateContactService
    const contact = await FindOrCreateContactService({
      ...visitor,
      from,
      whatsapp,
      channel,
      companyId: whatsapp.companyId // Passando diretamente
    });

    // Passando o companyId para a função de criação ou atualização do ticket
    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp.id!,
      unreadMessages,
      contact.companyId || whatsapp.companyId // Passando o companyId aqui, já atribuído corretamente do contato ou whatsapp
    );

    // Obtendo o companyId corretamente
    let companyId = contact.companyId || whatsapp.companyId || ticket.companyId;

    // Se o companyId ainda for indefinido, lança erro
    if (!companyId) {
      throw new Error("Erro: companyId não encontrado no contato, WhatsApp nem no Ticket.");
      console.log("Erro: companyId não encontrado no contato, WhatsApp nem no Ticket.");
    }
    
    
  if (contents[0]?.type === "text") {
  const messageData = await CreateMessageService({
    id,
    contactId: contact.id,
    body: contents[0].text || "",
    ticketId: ticket.id,
    fromMe: false,
    companyId: contact.companyId || whatsapp.companyId || ticket.companyId
  });

  await Ticket.update(
    { lastMessage: contents[0].text || "" },
    { where: { id: ticket.id } }
  );

  const io = getIO();
  const updatedTicket = await Ticket.findByPk(ticket.id, { include: ["contact"] });
  console.log("Ticket atualizado após mensagem de texto:", updatedTicket);
  if (updatedTicket) {
    io.to(updatedTicket.status)
    .to(ticket.id.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket: updatedTicket
    });
    console.log("Evento 'ticket' emitido para mensagem de texto:", {
      status: updatedTicket.status,
      ticketId: ticket.id.toString(),
      lastMessage: updatedTicket.lastMessage
    });
  }
} else if (contents[0]?.fileUrl) {
  //const media = await downloadFiles(contents[0].fileUrl, companyId);

  const media = await downloadFiles(contents[0].fileUrl, companyId, contents[0].type);

  if (typeof media.mimeType === "string") {
    const messageData = await CreateMessageService({
      id,
      contactId: contact.id,
      body: contents[0].text || "",
      ticketId: ticket.id,
      fromMe: false,
      companyId: contact.companyId || whatsapp.companyId || ticket.companyId,
      fileName: `${media.filename}`,
      mediaType: media.mimeType.split("/")[0],
      originalName: media.originalname
    });

    await Ticket.update(
      { lastMessage: contents[0].text || media.originalname },
      { where: { id: ticket.id } }
    );

    const io = getIO();
    const updatedTicket = await Ticket.findByPk(ticket.id, { include: ["contact"] });
    console.log("Ticket atualizado após mensagem com arquivo:", updatedTicket);
    if (updatedTicket) {
      io.to(updatedTicket.status)
      .to(ticket.id.toString())
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });
      console.log("Evento 'ticket' emitido para mensagem com arquivo:", {
        status: updatedTicket.status,
        ticketId: ticket.id.toString(),
        lastMessage: updatedTicket.lastMessage
      });
    }
  }
}
  } catch (error: any) {
    console.log(error);
  }
};

export default HubMessageListener;