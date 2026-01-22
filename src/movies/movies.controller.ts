import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  Patch,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @UsePipes(ValidationPipe)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: CreateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @UsePipes(ValidationPipe)
  @Patch(':id')
  updatePartial(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto
  ) {
    return this.moviesService.updatePartial(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}
