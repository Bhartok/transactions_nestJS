import { IsUUID } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Min,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/user.model';

@Table({
  tableName: 'balances',
  timestamps: true,
})
export class Balance extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  balanceId: string;

  @Min(0)
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  balance: number;

  @IsUUID()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
