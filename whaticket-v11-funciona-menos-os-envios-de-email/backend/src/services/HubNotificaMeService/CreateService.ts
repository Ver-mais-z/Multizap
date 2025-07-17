import * as Yup from "yup";
import AppError from "../../errors/AppError";
import HubNotificaMe from "../../models/HubNotificaMe";
import Whatsapp from "../../models/Whatsapp"; // Importando a tabela Whatsapps

interface Data {
  nome: string;
  token: string;
  companyId: number | string;
  tipo: string;
}

const CreateService = async (data: Data): Promise<HubNotificaMe> => {
  const { nome, token, tipo, companyId  } = data;

  // Validação do token
  const schema = Yup.object().shape({
    token: Yup.string()
      .min(6, "ERR_HUBNOTIFICAME_INVALID_TOKEN")
      .required("ERR_HUBNOTIFICAME_REQUIRED")
  });

  try {
    await schema.validate({ token });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Criando o registro na tabela HubNotificaMe
  const record = await HubNotificaMe.create({ ...data, tipo });


  // Criando o registro na tabela Whatsapp
  const whatsappRecord = await Whatsapp.create({
    qrcode: token, // Mesma informação do token
    status: "CONNECTED", // Status fixo
    createdAt: new Date(), // Data e hora atual
    updatedAt: new Date(), // Data e hora atual
    name: nome, // Mesmo valor de nome
    companyId: companyId, // Pega da requisição
    type: tipo, // Mesmo valor de tipo
  });

  return record;
};

export default CreateService;
