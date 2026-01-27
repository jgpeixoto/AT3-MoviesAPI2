import { IsInt, IsString, Max, Min } from 'class-validator';

export class ImportMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  releaseYear: number;

  @IsInt()
  duration: number;

  @IsString()
  genre: string;
}
