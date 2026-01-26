import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

type ExportFormat = 'csv' | 'json';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async exportUserMovies(userId: number, email: string, format: ExportFormat) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        movieList: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const content = this.generateContent(user.movieList, format);
    const filename = `movies-${randomUUID()}.${format}`;

    console.log('Sending file to:', email);
    console.log(filename);
    console.log(content);

    return { message: 'Movies export generated' };
  }

  private generateContent<T extends Record<string, unknown>>(
    data: T[],
    format: ExportFormat
  ): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    return this.toCsv(data);
  }

  private toCsv<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]).join(',');

    const rows = data.map((item) =>
      Object.values(item)
        .map((value) => `"${String(value)}"`)
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }
}
