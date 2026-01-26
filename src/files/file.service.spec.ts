import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FileService', () => {
  let service: FileService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should generate a unique filename when exporting movies', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashed',
      movieList: [] as any,
    });

    jest
      .spyOn(service as any, 'getUuid')
      .mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

    const result = await service.exportUserMovies(1, 'test@test.com', 'json');

    expect(result).toEqual({
      message: 'Movies export generated',
    });

    expect((service as any).getUuid).toHaveBeenCalled();
  });
});
