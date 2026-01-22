import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { FileModule } from './files/file.module';

@Module({
  imports: [MoviesModule, AuthModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}