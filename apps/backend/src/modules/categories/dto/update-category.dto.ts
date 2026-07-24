import type { UpdateCategoryDto as UpdateCategoryDtoShape } from "@expense-tracker/shared";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCategoryDto implements UpdateCategoryDtoShape {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  color?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  icon?: string;
}
