import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgetPasswordDTO {
  @MinLength(6)
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsString()
  token: string;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
