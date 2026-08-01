import type { CreateTransactionDto as CreateTransactionDtoShape } from "@expense-tracker/shared";
import { TransactionType } from "@expense-tracker/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateTransactionDto implements CreateTransactionDtoShape {
  @ApiProperty({ example: 42.5 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ example: "Weekly groceries" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2026-07-25" })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: "b3f1c2e0-...-uuid" })
  @IsUUID()
  categoryId!: string;
}
