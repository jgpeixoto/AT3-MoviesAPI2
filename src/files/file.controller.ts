import { Controller, Get, Query } from '@nestjs/common';
import { FileService } from './file.service';
import { ExportQueryDto } from './dto/export-query.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('export/movies')
  async exportMovies(
    @Query() query: ExportQueryDto
  ): Promise<{ message: string }> {
    const userId = 1;
    const email = 'test@test.com';

    return this.fileService.exportUserMovies(userId, email, query.format);
  }
}
