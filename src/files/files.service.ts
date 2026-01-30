import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { ImportMovieDto } from './dto/import-movie.dto';
import { MovieListMapper } from './mappers/movie-list.mapper';
import { RatingMapper } from './mappers/rating.mapper';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

type ExportFormat = 'json' | 'csv';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportMovies(
    userId: number,
    email: string,
    format: ExportFormat = 'json'
  ) {
    const movies = await this.prisma.userMovieList.findMany({
      where: { userId },
      include: { post: true },
    });

    const payload = movies.map((item) =>
      MovieListMapper.toExportDTO(item.post)
    );

    return this.generateAndSendFile(payload, email, 'movies', format);
  }

  async exportRatings(
    userId: number,
    email: string,
    format: ExportFormat = 'json'
  ) {
    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      include: { movie: true },
    });

    const payload = ratings.map((r) => RatingMapper.toExportDTO(r));

    return this.generateAndSendFile(payload, email, 'ratings', format);
  }

  async importMovies(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new BadRequestException('File not sent');
    }

    let rawData: unknown[];

    if (
      file.mimetype === 'application/json' ||
      file.originalname.endsWith('.json')
    ) {
      rawData = JSON.parse(file.buffer.toString());
    } else if (
      file.mimetype === 'text/csv' ||
      file.originalname.endsWith('.csv')
    ) {
      rawData = parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    } else {
      throw new BadRequestException('File format not supported');
    }

    const movies: ImportMovieDto[] = [];

    for (const item of rawData) {
      const dto = plainToInstance(ImportMovieDto, item);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'Invalid data in the file.',
          errors: errors.map((e) => e.constraints),
        });
      }

      movies.push(dto);
    }

    let imported = 0;

    for (const movie of movies) {
      await this.prisma.$transaction(async (tx) => {
        const dbMovie = await tx.movie.upsert({
          where: {
            title_releaseYear: {
              title: movie.title,
              releaseYear: movie.releaseYear,
            },
          },
          update: {},
          create: {
            title: movie.title,
            description: movie.description,
            releaseYear: movie.releaseYear,
            genre: movie.genre,
            duration: movie.duration,
          },
        });

        try {
          await tx.userMovieList.create({
            data: {
              userId,
              movieId: dbMovie.id,
            },
          });
          imported++;
        } catch (error: any) {
          if (error?.code !== 'P2002') {
            throw error;
          }
          this.logger.warn(
            `Movie ${dbMovie.id} already exists in user ${userId} list`
          );
        }
      });
    }

    return { imported };
  }

  private async generateAndSendFile<T extends object>(
    data: T[],
    email: string,
    prefix: string,
    format: ExportFormat
  ) {
    const extension = format === 'csv' ? 'csv' : 'json';
    const fileName = `${prefix}-${randomUUID()}.${extension}`;
    const baseDir = this.getExportDirectory();

    await fs.mkdir(baseDir, { recursive: true });

    const filePath = path.join(baseDir, fileName);

    if (format === 'csv') {
      const csv = stringify(data, { header: true });
      await fs.writeFile(filePath, csv);
    } else {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }

    await this.sendEmailWithAttachment(email, filePath, fileName);
    await fs.unlink(filePath);

    return {
      file: fileName,
      sentTo: email,
      format,
    };
  }

  private getExportDirectory(): string {
    return path.join(process.cwd(), process.env.EXPORT_DIR ?? 'tmp/exports');
  }

  private async sendEmailWithAttachment(
    to: string,
    filePath: string,
    fileName: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Movies API" <no-reply@movies.com>',
      to,
      subject: 'Your export file',
      text: 'Attached is your exported file.',
      attachments: [{ filename: fileName, path: filePath }],
    });
  }
}
