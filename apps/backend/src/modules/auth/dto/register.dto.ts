import type { RegisterDto as RegisterDtoShape } from "@expense-tracker/shared";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto implements RegisterDtoShape {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
