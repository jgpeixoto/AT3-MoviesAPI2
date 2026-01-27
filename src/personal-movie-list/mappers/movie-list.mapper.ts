import { MovieListResponseDto } from '../dto/movie-list-response.dto';

export class MovieListMapper {
  static toDto(movie: any): MovieListResponseDto {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      duration: movie.duration,
      avgRating: Number(movie.avgRating),
      totalRatings: movie.totalRatings,
    };
  }
}
