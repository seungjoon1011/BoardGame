import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  profileImageKey?: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}
