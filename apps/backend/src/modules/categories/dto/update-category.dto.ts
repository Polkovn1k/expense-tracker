import type { UpdateCategoryDto as UpdateCategoryDtoShape } from "@expense-tracker/shared";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCategoryDto implements UpdateCategoryDtoShape {
  @ApiPropertyOptional({ example: "Groceries" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: "#22c55e" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  color?: string;

  @ApiPropertyOptional({ example: "shopping-cart" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  icon?: string;
}
