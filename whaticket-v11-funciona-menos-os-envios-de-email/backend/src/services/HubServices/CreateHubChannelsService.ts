import Whatsapp from "../../models/Whatsapp";
import { IChannel } from "../../controllers/ChannelHubController";
import { getIO } from "../../libs/socket";

// Interface de entrada
interface Request {
  channels: IChannel[];
  companyId: number; // Adicionando companyId
}

// Interface de saída
interface Response {
  whatsapps: Whatsapp[];
}

// Serviço para criar canais
const CreateChannelsService = async ({
  channels,
  companyId, // Recebendo companyId como parâmetro
}: Request): Promise<Response> => {

  // Mapeando os canais e atribuindo o companyId
  channels = channels.map(channel => {
    return {
      ...channel,
      type: channel.channel,
      qrcode: channel.id,
      status: "CONNECTED",
      companyId: companyId, // Incluindo o companyId
    };
  });

  // Criando múltiplos registros de WhatsApp
  const whatsapps = await Whatsapp.bulkCreate(channels);

  // Retornando os whatsapps criados
  return { whatsapps };
};

export default CreateChannelsService;