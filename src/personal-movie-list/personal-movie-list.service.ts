import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMovieDto } from './dto/add-movie.dto';
import { PersonalMovieList } from './interfaces/personal-movie-list.interface';
import { MovieListMapper } from './mappers/movie-list.mapper';

@Injectable()
export class MovieListService {
  private readonly logger = new Logger(MovieListService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addMovie(
    userId: number,
    addMovieDto: AddMovieDto
  ): Promise<PersonalMovieList> {
    const { movieId } = addMovieDto;

    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      this.logger.warn(
        `User ${userId} tried to add non-existent movie ${movieId}`
      );
      throw new BadRequestException('Movie not found in catalog');
    }

    try {
      this.logger.log(`Adding movie ID ${movieId} to user ID ${userId} list`);

      return await this.prisma.userMovieList.create({
        data: {
          userId: userId,
          movieId: movieId,
        },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'Movie already exists in your personal list'
        );
      }
      throw error;
    }
  }

  async findAll(userId: number, page: number = 0) {
    const take = 10;
    const skip = page * take;

    this.logger.log(`Fetching list for user ${userId} - Page ${page}`);

    const [items, total] = await Promise.all([
      this.prisma.userMovieList.findMany({
        where: { userId },
        skip,
        take,
        include: { post: true },
      }),
      this.prisma.userMovieList.count({ where: { userId } }),
    ]);

    return {
      data: items.map((item) => MovieListMapper.toDto(item.post)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take) - 1,
      },
    };
  }
  async remove(userId: number, movieId: number) {
    this.logger.log(`Removing movie ${movieId} from user ${userId}`);

    try {
      return await this.prisma.userMovieList.delete({
        where: {
          userId_movieId: { userId, movieId },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Movie not found in your list');
      }
      throw error;
    }
  }
}
