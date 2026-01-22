import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { FileModule } from './files/file.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MoviesModule, AuthModule, FileModule],
})
export class AppModule {}
