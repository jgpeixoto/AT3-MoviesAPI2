import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/common/request-with-user.interface';

@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('export/movies')
  async exportMovies(
    @Req() req: RequestWithUser,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    return this.filesService.exportMovies(req.user.id, req.user.email, format);
  }

  @Get('export/ratings')
  async exportRatings(
    @Req() req: RequestWithUser,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    return this.filesService.exportRatings(req.user.id, req.user.email, format);
  }

  @Post('import/movies')
  @UseInterceptors(FileInterceptor('file'))
  async importMovies(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser
  ) {
    return this.filesService.importMovies(file, req.user.id);
  }
}
