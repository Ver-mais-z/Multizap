import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "whatsappNumber", {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "whatsappNumber");
  }
};
