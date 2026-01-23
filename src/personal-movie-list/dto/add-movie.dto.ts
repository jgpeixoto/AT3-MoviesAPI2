import { IsInt, IsNotEmpty } from 'class-validator';

export class AddMovieDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;
}
