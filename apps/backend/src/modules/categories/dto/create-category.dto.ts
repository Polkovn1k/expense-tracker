import type { CreateCategoryDto as CreateCategoryDtoShape } from "@expense-tracker/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateCategoryDto implements CreateCategoryDtoShape {
  @ApiProperty({ example: "Groceries" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "#22c55e" })
  @IsString()
  @MinLength(1)
  color!: string;

  @ApiProperty({ example: "shopping-cart" })
  @IsString()
  @MinLength(1)
  icon!: string;
}
