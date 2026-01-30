import { Rating, Movie } from '@prisma/client';
import { ExportRatingDto } from '../dto/export-rating.dto';

export class RatingMapper {
  static toExportDTO(rating: Rating & { movie: Movie }): ExportRatingDto {
    return {
      movieTitle: rating.movie.title,
      score: Number(rating.score),
      updatedAt: rating.updatedAt,
    };
  }
}
