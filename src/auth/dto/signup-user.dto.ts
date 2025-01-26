import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class SignupInputDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @Transform(({ value }) => parseInt(value, 10))
  @Min(0)
  @IsInt()
  @IsOptional()
  amount: number;
}

export class SignupResponseDto extends SignupInputDto {
  @IsUUID()
  id: string;
}
