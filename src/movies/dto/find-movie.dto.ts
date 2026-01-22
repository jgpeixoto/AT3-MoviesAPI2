import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum FindMovieOrderBy {
  title,
  releaseYear,
  score,
}

export class FindMovieDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  page: number = 0;
  @IsString()
  @IsOptional()
  title: string;
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @IsOptional()
  releaseYear: number;
  @IsString()
  @IsOptional()
  genre: string;
  @IsEnum(FindMovieOrderBy)
  @IsOptional()
  orderBy: FindMovieOrderBy;
}
