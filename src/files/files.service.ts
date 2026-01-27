import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { ImportMovieDto } from './dto/import-movie.dto';
import { Movie } from '@prisma/client';
import { MovieListMapper } from './mappers/movie-list.mapper';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // EXPORT MOVIES
  // =========================
  async exportMovies(userId: number, email: string) {
    const movies = (await this.prisma.userMovieList.findMany({
      where: { userId },
      include: { post: true },
    })) as Array<{ post: Movie }>;

    const payload = movies.map((item) =>
      MovieListMapper.toExportDTO(item.post)
    );

    return this.generateAndSendFile(payload, email, 'movies');
  }

  // =========================
  // EXPORT RATINGS
  // =========================
  async exportRatings(userId: number, email: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      include: { movie: true },
    });

    const payload = ratings.map((rating) => ({
      movieTitle: rating.movie.title,
      score: rating.score,
      updatedAt: rating.updatedAt,
    }));

    return this.generateAndSendFile(payload, email, 'ratings');
  }

  // =========================
  // IMPORT MOVIES
  // =========================
  async importMovies(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new BadRequestException('File not provided');
    }

    const content = JSON.parse(file.buffer.toString()) as ImportMovieDto[];

    for (const movie of content) {
      await this.prisma.movie.create({
        data: {
          title: movie.title,
          description: movie.description,
          releaseYear: movie.releaseYear,
          genre: movie.genre,
          duration: movie.duration,
          users: {
            connect: { id: userId },
          },
        },
      });
    }

    return { imported: content.length };
  }

  // =========================
  // FILE GENERATION
  // =========================
  private async generateAndSendFile(
    data: unknown,
    email: string,
    prefix: string
  ) {
    const fileName = `${prefix}-${randomUUID()}.json`;
    const baseDir = this.getExportDirectory();

    await fs.mkdir(baseDir, { recursive: true });

    const filePath = path.join(baseDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    await this.sendEmailWithAttachment(email, filePath, fileName);

    await fs.unlink(filePath);

    return {
      file: fileName,
      sentTo: email,
    };
  }

  // =========================
  // EXPORT DIRECTORY (.env)
  // =========================
  private getExportDirectory(): string {
    return path.join(process.cwd(), process.env.EXPORT_DIR ?? 'tmp/exports');
  }

  // =========================
  // EMAIL
  // =========================
  private async sendEmailWithAttachment(
    this: void,
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
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    });
  }
}
