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
    this.logger.log('Incoming movie: ' + JSON.stringify(createMovieDto));
    return this.prisma.movie.create({ data: createMovieDto });
  }

  async findAll(findMovieDto: FindMovieDto) {
    this.logger.log(
      'Received find all request with params + ' + JSON.stringify(findMovieDto)
    );
    return this.prisma.movie.findMany({
      skip: findMovieDto.page * 10,
      take: 10,
      where: {
        title: findMovieDto.title ? findMovieDto.title : undefined,
        releaseYear: findMovieDto.releaseYear
          ? findMovieDto.releaseYear
          : undefined,
        genre: findMovieDto.genre ? findMovieDto.genre : undefined,
      },
      orderBy: {
        title:
          findMovieDto.orderBy === FindMovieOrderBy.title ? 'asc' : undefined,
        releaseYear:
          findMovieDto.orderBy === FindMovieOrderBy.releaseYear
            ? 'asc'
            : undefined,
        avgRating:
          findMovieDto.orderBy === FindMovieOrderBy.score ? 'asc' : undefined,
      },
    });
  }

  async findOne(id: number) {
    this.logger.log('Received find one request for ID ' + id);
    return this.prisma.movie.findUnique({ where: { id } });
  }

  async update(id: number, updateMovieDto: CreateMovieDto) {
    this.logger.log(
      'Updating movie at id ' +
        id +
        ' with data ' +
        JSON.stringify(updateMovieDto)
    );
    return this.prisma.movie.update({ where: { id }, data: updateMovieDto });
  }

  async updatePartial(id: number, updateMovieDto: UpdateMovieDto) {
    this.logger.log(
      'Updating movie partially at id ' +
        id +
        ' with data ' +
        JSON.stringify(updateMovieDto)
    );
    return this.prisma.movie.update({ where: { id }, data: updateMovieDto });
  }

  async remove(id: number) {
    this.logger.log('Removing movie at id ' + id);
    try {
      return this.prisma.movie.delete({ where: { id } });
      // pending: ADD USER LIST DELETION AND REVIEW DELETION
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }
}
