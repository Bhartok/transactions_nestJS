import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Transaction } from 'src/transactions/transaction.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING(),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  balance: number;

  @Column({
    type: DataType.STRING(),
    allowNull: false,
  })
  password: string;

  @HasMany(() => Transaction)
  transactions: Transaction[];
}
