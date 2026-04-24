import { IsArray, IsNumber, IsString } from 'class-validator';

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
}
