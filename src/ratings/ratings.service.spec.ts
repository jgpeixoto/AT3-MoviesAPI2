import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  movie: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  rating: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },

  $transaction: jest.fn().mockImplementation((arg: any) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return arg(mockPrisma) as Promise<unknown>;
  }),
};

describe('RatingsService', () => {
  let service: RatingsService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rateMovie', () => {
    it('should rate a movie successfully and update stats', async () => {
      const userId = 1;
      const dto = { movieId: 10, score: 9 };

      prisma.movie.findUnique.mockResolvedValue({
        id: 10,
        title: 'Test Movie',
      });
      prisma.rating.upsert.mockResolvedValue({
        id: 1,
        score: 9,
        userId,
        movieId: 10,
      });
      prisma.rating.aggregate.mockResolvedValue({
        _avg: { score: 9 },
        _count: { score: 1 },
      });

      const result = await service.rateMovie(userId, dto);
      expect(result).toEqual(expect.objectContaining({ score: 9 }));
      expect(prisma.rating.upsert).toHaveBeenCalled();
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { avgRating: 9, totalRatings: 1 },
      });
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      prisma.movie.findUnique.mockResolvedValue(null);

      await expect(
        service.rateMovie(1, { movieId: 999, score: 5 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUser', () => {
    it('should return a paginated list of ratings', async () => {
      const mockRatings = [{ id: 1, score: 10 }];
      const total = 1;

      prisma.rating.findMany.mockResolvedValue(mockRatings);
      prisma.rating.count.mockResolvedValue(total);

      const result = await service.findAllByUser(1, 1, 10);

      expect(result.data).toEqual(mockRatings);
      expect(result.meta.total).toBe(1);
    });

    it('should handle empty list ensuring lastPage is at least 1', async () => {
      prisma.rating.findMany.mockResolvedValue([]);
      prisma.rating.count.mockResolvedValue(0);

      const result = await service.findAllByUser(1, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.lastPage).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a rating if user is owner', async () => {
      const userId = 1;
      const ratingId = 5;

      prisma.rating.findUnique.mockResolvedValue({
        id: ratingId,
        userId: 1,
        movieId: 10,
      });
      prisma.rating.update.mockResolvedValue({ id: ratingId, score: 8 });
      prisma.rating.aggregate.mockResolvedValue({
        _avg: { score: 8 },
        _count: { score: 1 },
      });

      const result = await service.update(ratingId, userId, { score: 8 });

      expect(result.score).toBe(8);
      expect(prisma.rating.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is NOT owner', async () => {
      const userId = 1;
      const ownerId = 2;

      prisma.rating.findUnique.mockResolvedValue({
        id: 5,
        userId: ownerId,
        movieId: 10,
      });

      await expect(service.update(5, userId, { score: 0 })).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException if rating does not exist', async () => {
      prisma.rating.findUnique.mockResolvedValue(null);

      await expect(service.update(999, 1, { score: 0 })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should remove rating if user is owner', async () => {
      prisma.rating.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        movieId: 10,
      });
      prisma.rating.aggregate.mockResolvedValue({
        _avg: { score: null },
        _count: { score: 0 },
      });

      await service.remove(1, 1);

      expect(prisma.rating.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { avgRating: 0, totalRatings: 0 },
      });
    });

    it('should throw ForbiddenException if user is NOT owner', async () => {
      prisma.rating.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
        movieId: 10,
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if rating does not exist', async () => {
      prisma.rating.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
