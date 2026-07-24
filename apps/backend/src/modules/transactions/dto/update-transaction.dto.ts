import type { UpdateTransactionDto as UpdateTransactionDtoShape } from "@expense-tracker/shared";
import { TransactionType } from "@expense-tracker/shared";
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class UpdateTransactionDto implements UpdateTransactionDtoShape {
  @IsOptional()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
