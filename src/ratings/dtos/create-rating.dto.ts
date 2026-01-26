import { IsNotEmpty, IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsInt()
  movieId: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  score: number;
}
