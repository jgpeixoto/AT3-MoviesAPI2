import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MovieListService } from './personal-movie-list.service';
import { AddMovieDto } from './dto/add-movie.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PersonalMovieList } from './interfaces/personal-movie-list.interface';
import { RequestWithUser } from 'src/common/request-with-user.interface';

@Controller('personal-list')
@UseGuards(AuthGuard)
export class MovieListController {
  constructor(private readonly movieListService: MovieListService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async add(
    @Req() req: RequestWithUser,
    @Body() addMovieDto: AddMovieDto
  ): Promise<PersonalMovieList> {
    const userId = req.user.id;
    return this.movieListService.addMovie(userId, addMovieDto);
  }

  @Get()
  async list(
    @Req() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number
  ) {
    const userId = req.user.id;
    return this.movieListService.findAll(userId, page);
  }
  @Delete(':movieId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('movieId', ParseIntPipe) movieId: number
  ) {
    const userId = req.user.id;
    return this.movieListService.remove(userId, movieId);
  }
}
