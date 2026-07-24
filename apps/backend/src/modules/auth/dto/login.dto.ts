import type { LoginDto as LoginDtoShape } from "@expense-tracker/shared";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto implements LoginDtoShape {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
