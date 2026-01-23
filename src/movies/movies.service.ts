import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { FindMovieDto, FindMovieOrderBy } from './dto/find-movie.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieDto) {
    this.logger.log('Creating new movie: ' + JSON.stringify(createMovieDto));
    return this.prisma.movie.create({ data: createMovieDto });
  }

  async findAll(findMovieDto: FindMovieDto) {
    this.logger.log(
      'Received find all request with params ' + JSON.stringify(findMovieDto)
    );
    const page = +(findMovieDto.page ?? 0);
    const movieList = await this.prisma.movie.findMany({
      skip: page * 10,
      take: 10,
      where: {
        title: findMovieDto.title ? findMovieDto.title : undefined,
        releaseYear: findMovieDto.releaseYear
          ? findMovieDto.releaseYear
          : undefined,
        genre: findMovieDto.genre ? findMovieDto.genre : undefined,
      },
      orderBy: this.getSortingType(findMovieDto.orderBy),
    });
    return { page: page, movies: movieList };
  }

  private getSortingType(orderBy: string): any {
    if (!orderBy) return {};
    switch (orderBy) {
      case FindMovieOrderBy[FindMovieOrderBy.title]:
        return { title: 'asc' };
      case FindMovieOrderBy[FindMovieOrderBy.oldest]:
        return { releaseYear: 'asc' };
      case FindMovieOrderBy[FindMovieOrderBy.newest]:
        return { releaseYear: 'desc' };
      case FindMovieOrderBy[FindMovieOrderBy.lowest]:
        return { avgRating: 'asc' };
      case FindMovieOrderBy[FindMovieOrderBy.highest]:
        return { avgRating: 'desc' };
    }
  }

  async findOne(id: number) {
    this.logger.log('Received find one request for ID ' + id);
    try {
      return await this.prisma.movie.findUnique({ where: { id } });
    } catch (error) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }

  async update(id: number, createMovieDto: CreateMovieDto) {
    this.logger.log(
      'Updating movie at id ' +
        id +
        ' with data ' +
        JSON.stringify(createMovieDto)
    );
    try {
      return await this.prisma.movie.update({
        where: { id },
        data: createMovieDto,
      });
    } catch (error) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }

  async updatePartial(id: number, updateMovieDto: UpdateMovieDto) {
    this.logger.log(
      'Updating movie partially at id ' +
        id +
        ' with data ' +
        JSON.stringify(updateMovieDto)
    );
    try {
      return await this.prisma.movie.update({
        where: { id },
        data: updateMovieDto,
      });
    } catch (error) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }

  async remove(id: number) {
    this.logger.log('Removing movie at id ' + id);
    try {
      await this.prisma.movie.delete({ where: { id } });
      return { deletedMovieId: id };
    } catch (error) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }
}
