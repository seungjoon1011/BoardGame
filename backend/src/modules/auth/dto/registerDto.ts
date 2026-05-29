import {
  IsString,
  IsEmail,
  MinLength,
  IsDateString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class RegisterDto {
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
