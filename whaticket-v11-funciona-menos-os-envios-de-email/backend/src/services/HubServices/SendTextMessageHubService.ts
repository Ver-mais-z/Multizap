require("dotenv").config();
const { Client, TextContent } = require("notificamehubsdk");
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { getIO } from "../../libs/socket";

export const SendTextMessageService = async (
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any,
  companyIdOld: number //Apenas para completar a quantidade de argumentos
) => {

  // Buscar o ticket para obter o companyId
  const ticket = await Ticket.findOne({ where: { id: ticketId } });

  if (!ticket) {
    throw new Error("Ticket não encontrado");
  }

  const companyId = ticket.companyId; // Agora temos o companyId
  
  const notificameHubToken = await showHubToken();

  const client = new Client(notificameHubToken);

  let channelClient;

  message = message.replace(/\n/g, " ");

  const content = new TextContent(message);

  let contactNumber;

  if(contact.messengerId && !contact.instagramId){
    contactNumber = contact.messengerId
    channelClient = client.setChannel('facebook');
  }
  if(!contact.messengerId && contact.instagramId){
    contactNumber = contact.instagramId
    channelClient = client.setChannel('instagram');
  }

  try {

    console.log({
      token: connection.qrcode,
      number: contactNumber,
      content,
      message,
      companyId
    });

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
  fromMe: true
});

await Ticket.update(
  { lastMessage: message },
  { where: { id: ticketId } }
);

const io = getIO();
const updatedTicket = await Ticket.findByPk(ticketId, { include: ["contact"] });
console.log("Ticket atualizado após envio do atendente:", updatedTicket);
if (updatedTicket) {
  io.to(updatedTicket.status)
    .to(ticketId.toString())
    .emit("message", {
      action: "create",
      message: newMessage,
      ticket: updatedTicket
    });
  console.log("Evento 'message' emitido para envio:", {
    status: updatedTicket.status,
    ticketId: ticketId.toString(),
    lastMessage: updatedTicket.lastMessage
  });

 io.to(updatedTicket.status)
  .to(ticketId.toString())
  .emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket: updatedTicket
  });
  console.log("Evento 'ticket' emitido para envio:", {
    status: updatedTicket.status,
    ticketId: ticketId.toString(),
    lastMessage: updatedTicket.lastMessage
  });
}

return newMessage;


  } catch (error) {
    console.log("Error:", error);
  }
};