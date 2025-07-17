import AppError from "../../errors/AppError";
import HubNotificaMe from "../../models/HubNotificaMe";

interface Data {
  nome: string;
  token: string;
  id?: number | string;
}

const UpdateService = async (data: Data): Promise<HubNotificaMe> => {
  const { id, nome, token } = data;

  const record = await HubNotificaMe.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  await record.update({
    nome,
    token
  });

  return record;
};

export default UpdateService;
