import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieDto) {
    this.logger.log('Incoming movie: ' + JSON.stringify(createMovieDto));
    return this.prisma.movie.create({ data: createMovieDto });
  }

  async findAll() {
    this.logger.log('Received find all request');
    return this.prisma.movie.findMany();
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
        JSON.stringify(updateMovieDto),
    );
    return this.prisma.movie.update({ where: { id }, data: updateMovieDto });
  }

  async updatePartial(id: number, updateMovieDto: UpdateMovieDto) {
    this.logger.log(
      'Updating movie partially at id ' +
        id +
        ' with data ' +
        JSON.stringify(updateMovieDto),
    );
    return this.prisma.movie.update({ where: { id }, data: updateMovieDto });
  }

  async remove(id: number) {
    this.logger.log('Removing movie at id ' + id);
    try {
      return this.prisma.movie.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }
}
