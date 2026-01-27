jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FilesService', () => {
  let service: FilesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: {
            userMovieList: {
              findMany: jest.fn(),
            },
            rating: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(FilesService);
    prisma = module.get(PrismaService);
  });

  it('should export movies without throwing', async () => {
    jest.spyOn(prisma.userMovieList, 'findMany').mockResolvedValue([]);

    const result = await service.exportMovies(1, 'test@test.com');

    expect(result).toHaveProperty('file');
    expect(result).toHaveProperty('sentTo');
  });
});
