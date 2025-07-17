import { Sequelize, Op, Filterable } from "sequelize";
import HubNotificaMe from "../../models/HubNotificaMe"; // Alterado para o modelo HubNotificaMe

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number | string;
}

interface Response {
  records: HubNotificaMe[]; // Alterado para o tipo HubNotificaMe
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

  // Condições de filtro baseadas no searchParam
  let whereCondition: Filterable["where"] = {
    [Op.or]: [
      {
        nome: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("nome")), "LIKE", `%${sanitizedSearchParam}%`)
      },
      {
        token: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("token")), "LIKE", `%${sanitizedSearchParam}%`)
      },
      {
        tipo: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("tipo")), "LIKE", `%${sanitizedSearchParam}%`)
      }
    ]
  };

  whereCondition = {
    ...whereCondition,
    companyId
  };

  // Paginação
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // Buscando registros com base na condição de filtro
  const { count, rows: records } = await HubNotificaMe.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["tipo", "ASC"]] // Ordenando por token, mas você pode ajustar conforme necessário
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
