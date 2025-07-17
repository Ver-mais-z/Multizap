import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";

@Table({
  tableName: "HubNotificaMe", // 🔴 Garantindo que o Sequelize use o nome correto da tabela
  timestamps: true
})

class HubNotificaMe extends Model<HubNotificaMe> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nome: string; // Adicionado o campo para o nome

  @Column
  token: string; // Adicionado o campo para o token  

  @Column
  tipo: string; // Adicionado o campo para o tipo

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default HubNotificaMe;