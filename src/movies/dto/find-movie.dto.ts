import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum FindMovieOrderBy {
  title,
  oldest,
  newest,
  lowest,
  highest,
}

export class FindMovieDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page?: number = 0;
  @IsString()
  @IsOptional()
  title?: string;
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @IsOptional()
  @Type(() => Number)
  releaseYear?: number;
  @IsString()
  @IsOptional()
  genre?: string;
  @IsEnum(FindMovieOrderBy, {
    message:
      'orderBy must be one of either: title, oldest, newest, lowest, highest',
  })
  @IsOptional()
  orderBy?: string;
}
