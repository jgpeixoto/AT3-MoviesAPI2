import { Movie } from '@prisma/client';
import { ExportMovieDto } from '../dto/export-movie.dto';

export class MovieListMapper {
  static toExportDTO(movie: Movie): ExportMovieDto {
    return {
      title: movie.title,
      description: movie.description,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      duration: movie.duration,
    };
  }
}
