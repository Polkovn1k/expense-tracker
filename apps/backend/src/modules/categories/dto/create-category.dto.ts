import type { CreateCategoryDto as CreateCategoryDtoShape } from "@expense-tracker/shared";
import { IsString, MinLength } from "class-validator";

export class CreateCategoryDto implements CreateCategoryDtoShape {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  color!: string;

  @IsString()
  @MinLength(1)
  icon!: string;
}
