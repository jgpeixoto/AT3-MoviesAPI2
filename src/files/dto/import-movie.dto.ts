import { IsInt, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  releaseYear: number;

  @Type(() => Number)
  @IsInt()
  duration: number;

  @IsString()
  genre: string;
}
