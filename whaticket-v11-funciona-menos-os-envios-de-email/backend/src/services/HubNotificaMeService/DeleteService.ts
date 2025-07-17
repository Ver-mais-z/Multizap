import HubNotificaMe from "../../models/HubNotificaMe";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp"; // Importando a tabela Whatsapps

const DeleteService = async (id: string): Promise<void> => {
  // Busca o registro em HubNotificaMe pelo ID
  const record = await HubNotificaMe.findOne({ where: { id } });

  if (!record) {
    throw new AppError("ERR_NO_HUBNOTIFICAME_FOUND", 404);
  }

  // Deleta da tabela Whatsapps onde qrcode = token do HubNotificaMe encontrado
  await Whatsapp.destroy({ where: { qrcode: record.token } });

  // Agora remove o registro da HubNotificaMe
  await record.destroy();
};

export default DeleteService;
