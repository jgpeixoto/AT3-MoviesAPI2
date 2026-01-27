import { Controller, Get, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { FileService } from './file.service';
import { ExportQueryDto } from './dto/export-query.dto';
import { AuthGuard } from '../auth/auth.guard';

interface AuthenticatedRequest {
  user: {
    id: number;
    email: string;
  };
}

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Get('movies')
  async exportMovies(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExportQueryDto
  ) {
    const { id, email } = req.user;

    this.logger.log(
      `Export request received | userId=${id} | format=${query.format}`
    );

    return this.fileService.exportUserMovies(id, email, query.format);
  }
}
