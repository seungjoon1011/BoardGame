import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsDateString()
  birth: string;

  @IsOptional()
  @IsString()
  profileImageKey?: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}
