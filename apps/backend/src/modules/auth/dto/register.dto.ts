import type { RegisterDto as RegisterDtoShape } from "@expense-tracker/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto implements RegisterDtoShape {
  @ApiProperty({ example: "Jane Doe" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
