import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface MessageData {
  id: string;
  contactId: number;
  body: string;
  ticketId: number;
  fromMe: boolean;
  queueId?: number;
  fileName?: string;
  mediaType?: string;
  originalName?: string;
  companyId: number; // Adicionando o companyId aqui
}

const CreateMessageService = async (messageData: MessageData): Promise<Message | any> => {
  
  console.log("creating message");
  console.log({messageData});
  
  const {
    id,
    contactId,
    body,
    ticketId,
    fromMe,
    fileName,
    mediaType,
    originalName,
    companyId // Adicionando companyId
  } = messageData;

  // Verificando se a mensagem ou arquivo está vazio
  if ((!body || body === "") && (!fileName || fileName === "")) {
    return;
  }

  const data: any = {
    id,
    contactId,
    body,
    ticketId,
    fromMe,
    ack: 2,
    companyId // Incluindo companyId no objeto de dados
  };

  if (fileName) {
    data.mediaUrl = fileName;
    data.mediaType = mediaType === "photo" ? "image" : mediaType;
    data.body = data.mediaUrl;

    console.log("MEDIA TYPE DENTRO DO CREATEHUBMESSAGESERVICE:", data.mediaType);
  }

  try {
    
    const newMessage = await Message.create(data); // Salvando a mensagem no banco de dados

    // LOG: Verificar a nova mensagem criada
    console.log("Nova mensagem criada:", newMessage);

    const message = await Message.findByPk(messageData.id, {
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          include: [
            "contact", "queue",
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["name"]
            }
          ]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    console.log("Mensagem buscada do banco:", message);

    if (message.ticket.queueId !== null && message.queueId === null) {
      await message.update({ queueId: message.ticket.queueId });
    }

    if (!message) {
      throw new Error("ERR_CREATING_MESSAGE");
    }


    if (message) {

      console.log("Mensagem emitida pelo WebSocket:", {
        action: "create",
        message,
        ticket: message.ticket,
        contact: message.ticket.contact
      });

      const io = getIO();
      io.to(message.ticketId.toString())
        .to(`company-${companyId}-${message.ticket.status}`)
        .to(`company-${companyId}-notification`)
        .to(`queue-${message.ticket.queueId}-${message.ticket.status}`)
        .to(`queue-${message.ticket.queueId}-notification`)
        .emit(`company-${companyId}-appMessage`, {
          action: "create",
          message,
          ticket: message.ticket,
          contact: message.ticket.contact
        });
    }

    return message;
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return null;
  }
};

export default CreateMessageService;