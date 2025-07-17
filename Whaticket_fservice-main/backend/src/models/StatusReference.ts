import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Message from "./Message";
import Contact from "./Contact";

@Table
class StatusReference extends Model<StatusReference> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER
  })
  id: number;

  @ForeignKey(() => Message)
  @Column
  messageId: number;

  @BelongsTo(() => Message)
  message: Message;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @Column(DataType.TEXT)
  statusContent: string;

  @Column
  statusId: string;

  @Column
  statusTimestamp: Date;

  // Novos campos para mídia
  @Column
  mediaType: string; // 'image', 'video', 'text'

  @Column(DataType.TEXT)
  mediaUrl: string;

  @Column(DataType.TEXT)
  mediaThumbnail: string;

  @Column(DataType.TEXT)
  mediaCaption: string;

  @Column
  mimetype: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default StatusReference;