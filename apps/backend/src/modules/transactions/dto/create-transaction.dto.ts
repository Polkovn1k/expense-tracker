import type { CreateTransactionDto as CreateTransactionDtoShape } from "@expense-tracker/shared";
import { TransactionType } from "@expense-tracker/shared";
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateTransactionDto implements CreateTransactionDtoShape {
  @IsPositive()
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @IsUUID()
  categoryId!: string;
}
