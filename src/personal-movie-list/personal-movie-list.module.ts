import { Module } from '@nestjs/common';
import { MovieListService } from './personal-movie-list.service';
import { MovieListController } from './personal-movie-list.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MovieListController],
  providers: [MovieListService],
  exports: [MovieListService],
})
export class PersonalMovieListModule {}
