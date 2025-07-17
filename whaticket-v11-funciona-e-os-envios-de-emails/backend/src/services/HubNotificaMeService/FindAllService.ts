import HubNotificaMe from "../../models/HubNotificaMe";

const FindAllService = async (): Promise<HubNotificaMe[]> => {
  const records: HubNotificaMe[] = await HubNotificaMe.findAll({
    order: [["tipo", "ASC"]] // Ordenando pelo token, por exemplo
  });
  return records;
};

export default FindAllService;
