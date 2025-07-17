import { Op } from "sequelize";
import HubNotificaMe from "../../models/HubNotificaMe";
import Company from "../../models/Company";

type Params = {
  companyId: string;
};

const FindService = async ({ companyId }: Params): Promise<HubNotificaMe[]> => {
  const records: HubNotificaMe[] = await HubNotificaMe.findAll({
    where: {
      companyId
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["id", "ASC"]]
  });

  return records;
};

export default FindService;
