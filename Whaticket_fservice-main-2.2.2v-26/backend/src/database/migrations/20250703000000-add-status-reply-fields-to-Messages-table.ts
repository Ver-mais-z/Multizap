import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Messages", "statusReply", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Messages", "statusId", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Messages", "statusReply"),
      queryInterface.removeColumn("Messages", "statusId")
    ]);
  }
};
