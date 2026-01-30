import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async rateMovie(userId: number, dto: CreateRatingDto) {
    const movieExists = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });

    if (!movieExists) {
      throw new NotFoundException(`Movie with ID ${dto.movieId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const rating = await tx.rating.upsert({
        where: {
          userId_movieId: {
            userId: userId,
            movieId: dto.movieId,
          },
        },
        update: { score: dto.score },
        create: {
          userId: userId,
          movieId: dto.movieId,
          score: dto.score,
        },
      });

      await this.updateMovieStats(dto.movieId, tx);

      return rating;
    });
  }

  async findAllByUser(userId: number, page: number = 0, limit: number = 10) {
    const take = 10;
    const skip = page * take;

    const [ratings, total] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { movie: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.rating.count({ where: { userId } }),
    ]);

    return {
      data: ratings,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take) - 1,
      },
    };
  }

  async update(ratingId: number, userId: number, dto: UpdateRatingDto) {
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!rating)
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);

    if (rating.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to change this rating'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.rating.update({
        where: { id: ratingId },
        data: { score: dto.score },
      });

      await this.updateMovieStats(rating.movieId, tx);

      return updated;
    });
  }

  async remove(ratingId: number, userId: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!rating)
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);

    if (rating.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to remove this rating'
      );
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.rating.delete({
        where: { id: ratingId },
      });

      await this.updateMovieStats(rating.movieId, tx);

      return { message: 'Rating removed' };
    });
  }

  private async updateMovieStats(
    movieId: number,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ) {
    const aggregations = await tx.rating.aggregate({
      where: { movieId },
      _avg: { score: true },
      _count: { score: true },
    });

    const average = Number(aggregations._avg.score) || 0;
    const total = Number(aggregations._count.score) || 0;

    await tx.movie.update({
      where: { id: movieId },
      data: {
        avgRating: average,
        totalRatings: total,
      },
    });
  }
}
