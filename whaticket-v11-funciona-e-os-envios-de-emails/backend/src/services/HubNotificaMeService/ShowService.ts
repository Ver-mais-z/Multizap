import HubNotificaMe from "../../models/HubNotificaMe"; // Substituímos QuickMessage por HubNotificaMe
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<HubNotificaMe> => {
  // Buscando o registro na tabela HubNotificaMe pelo ID
  const record = await HubNotificaMe.findByPk(id);

  // Verificando se o registro foi encontrado
  if (!record) {
    throw new AppError("ERR_NO_RECORD_FOUND", 404); // Mensagem de erro personalizada
  }

  return record; // Retorna o registro encontrado
};

export default ShowService;
