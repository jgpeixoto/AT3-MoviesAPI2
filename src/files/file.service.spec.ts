import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FileService', () => {
  let service: FileService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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

    service = moduleRef.get(FileService);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should export user movies in JSON format', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashed-password',
      movieList: [
        {
          id: 1,
          title: 'Matrix',
          description: 'Sci-fi',
          releaseYear: 1999,
          genre: 'Sci-fi',
          duration: 120,
        },
      ],
    } as unknown as ReturnType<
      typeof prismaService.user.findUnique
    > extends Promise<infer T>
      ? T
      : never);

    const result = await service.exportUserMovies(1, 'test@test.com', 'json');

    expect(result).toEqual({
      message: 'Movies export generated',
    });
  });

  it('should throw error if user is not found', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(
      service.exportUserMovies(1, 'test@test.com', 'json')
    ).rejects.toThrow('User not found');
  });
});
