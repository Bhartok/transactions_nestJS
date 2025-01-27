import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { Balance } from '../../balance/balance.model';
import { Transaction } from '../../transactions/entitites/transaction.model';

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
    type: DataType.STRING(),
    allowNull: false,
  })
  password: string;

  @HasOne(() => Balance)
  balance: Balance;

  @HasMany(() => Transaction)
  transactions: Transaction[];
}
