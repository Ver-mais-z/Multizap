import Setting from "../models/Setting";

export const showHubToken = async (): Promise<string | any> => {
  const notificameHubToken = await Setting.findOne({
    where: {
      key: "hubToken"
    }
  });

  if (!notificameHubToken) {
    throw new Error("Erro: Token do Notificame Hub não encontrado.");
  }

  if(notificameHubToken) {
    return notificameHubToken.value;
  }
};