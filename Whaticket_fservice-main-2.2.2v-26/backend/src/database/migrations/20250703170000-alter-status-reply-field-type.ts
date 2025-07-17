import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Messages", "statusReply", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.changeColumn("Messages", "statusId", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Messages", "statusReply", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn("Messages", "statusId", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  }
};
