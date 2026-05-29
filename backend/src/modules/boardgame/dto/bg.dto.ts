import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateBG {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  difficulty: number;

  @IsNumber()
  minPlayer: number;

  @IsNumber()
  maxPlayer: number;

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsOptional()
  @IsString()
  imageKey?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
