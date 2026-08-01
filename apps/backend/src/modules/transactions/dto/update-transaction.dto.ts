import type { UpdateTransactionDto as UpdateTransactionDtoShape } from "@expense-tracker/shared";
import { TransactionType } from "@expense-tracker/shared";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class UpdateTransactionDto implements UpdateTransactionDtoShape {
  @ApiPropertyOptional({ example: 42.5 })
  @IsOptional()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: "Weekly groceries" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "2026-07-25" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: "b3f1c2e0-...-uuid" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
