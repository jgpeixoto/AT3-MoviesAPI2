import { Test, TestingModule } from '@nestjs/testing';
import { MovieListService } from './personal-movie-list.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('MovieListService', () => {
  let service: MovieListService;

  const mockPrisma = {
    movie: {
      findUnique: jest.fn(),
    },
    userMovieList: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieListService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MovieListService>(MovieListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMovie', () => {
    const userId = 1;
    const addMovieDto = { movieId: 10 };

    it('should throw BadRequestException if movie does not exist in catalog', async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.addMovie(userId, addMovieDto)).rejects.toThrow(
        new BadRequestException('Movie not found in catalog')
      );
    });

    it('should throw ConflictException if movie is already in user list (P2002)', async () => {
      mockPrisma.movie.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.userMovieList.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.addMovie(userId, addMovieDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should add movie successfully', async () => {
      mockPrisma.movie.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.userMovieList.create.mockResolvedValue({
        userId,
        movieId: 10,
      });

      const result = await service.addMovie(userId, addMovieDto);
      expect(result).toEqual({ userId, movieId: 10 });
    });
  });

  describe('remove', () => {
    const userId = 1;
    const movieId = 10;

    it('should remove movie successfully', async () => {
      mockPrisma.userMovieList.delete.mockResolvedValue({ userId, movieId });

      const result = await service.remove(userId, movieId);
      expect(result).toEqual({ userId, movieId });
    });

    it('should throw BadRequestException if record not found (P2025)', async () => {
      mockPrisma.userMovieList.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(userId, movieId)).rejects.toThrow(
        new BadRequestException('Movie not found in your list')
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated data', async () => {
      const userId = 1;
      const mockItems = [{ post: { id: 1, title: 'Movie 1' } }];

      mockPrisma.userMovieList.findMany.mockResolvedValue(mockItems);
      mockPrisma.userMovieList.count.mockResolvedValue(1);

      const result = await service.findAll(userId, 0);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.total).toBe(1);
    });
  });
});
