import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateMovieDto {
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
