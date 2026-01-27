jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';

type PrismaMock = {
  userMovieList: {
    findMany: jest.Mock;
  };
  rating: {
    findMany: jest.Mock;
  };
};

describe('FilesService', () => {
  let service: FilesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      userMovieList: {
        findMany: jest.fn(),
      },
      rating: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(FilesService);
  });

  it('should export movies without throwing', async () => {
    prisma.userMovieList.findMany.mockResolvedValue([]);

    const result = await service.exportMovies(1, 'test@test.com');

    expect(result).toHaveProperty('file');
    expect(result).toHaveProperty('sentTo');
  });
});
