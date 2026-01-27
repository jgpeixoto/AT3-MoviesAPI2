import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ratings')
@UseGuards(AuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto, @Req() req) {
    const userId = Number(req.user.id);
    return this.ratingsService.rateMovie(userId, createRatingDto);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ) {
    const userId = Number(req.user.id);
    return this.ratingsService.findAllByUser(userId, page);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
    @Req() req
  ) {
    const userId = Number(req.user.id);
    return this.ratingsService.update(id, userId, updateRatingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = Number(req.user.id);
    return this.ratingsService.remove(id, userId);
  }
}
