import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  channel: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  companyId,
  queueId,
  channel
}: Request): Promise<Ticket> => {

  let connectionType;

if (channel === 'instagram') {
  connectionType = 'instagram';
} else if (channel === 'facebook') {
  connectionType = 'facebook';
}

  const connection = await Whatsapp.findOne({
    where: { type: connectionType! }
  });

  if (!connection) {
    throw new Error("Connection id not found");
  }

  // Verificação do companyId recebido
  console.log("companyId recebido:", companyId);


  await CheckContactOpenTickets(contactId, String(connection.id));

  // Obtendo as informações do contato com base no companyId do usuário
  const { isGroup } = await ShowContactService(contactId, companyId);

  if (queueId === undefined) {
    const user = await User.findByPk(userId, { include: ["queues"] });
    queueId = user?.queues.length === 1 ? user.queues[0].id : undefined;
  }

  // Criando um novo ticket com o companyId associado
  const newTicket = await Ticket.create({
    status,
    //lastMessage: null,
    lastMessage: null,  // Adicionando a última mensagem
    contactId,
    isGroup,
    whatsappId: connection.id,
    companyId  // Passando o companyId para garantir que o ticket pertença à empresa do usuário
  });

  const ticket = await Ticket.findByPk(newTicket.id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  const io = getIO();

  return ticket;
};

export default CreateTicketService;
