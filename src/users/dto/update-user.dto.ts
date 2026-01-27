import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(6)
  @IsNotEmpty()
  @IsString()
  password: string;
}
