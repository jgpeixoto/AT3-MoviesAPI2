import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MoviesController } from './movies.controller';
import { AuthModule } from '../auth/auth.module';

function getRndInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('MoviesService', () => {
  let service: MoviesService;
  const newIds: number[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      controllers: [MoviesController],
      providers: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    for (let i = 0; i < 5; i++) {
      newIds.push(
        (
          await service.create({
            title: `Test Movie Title ${i}`,
            genre: 'Test Genre',
            releaseYear: getRndInteger(1900, 2025),
            description: 'Test Description',
            duration: 3000,
          })
        ).id
      );
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      controllers: [MoviesController],
      providers: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should return a movie given a valid ID', async () => {
    const movie = await service.findOne(newIds[0]);
    expect(movie).toBeDefined();
    expect(movie.title).toBe(`Test Movie Title 0`);
  });

  it('should return NotFoundException when consulting an invalid ID', async () => {
    try {
      await service.findOne(0);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('should update a movie successfully given valid ID and body', async () => {
    const body = {
      title: 'Test Movie Updated 1',
      genre: 'Test Genre Updated',
      releaseYear: 2020,
      description: 'Test Description Updated',
      duration: 3600,
    };
    const movie = await service.update(newIds[1], body);
    expect(movie).toBeDefined();
    expect(movie.title).toBe(body.title);
    expect(movie.genre).toBe(body.genre);
    expect(movie.releaseYear).toBe(body.releaseYear);
    expect(movie.description).toBe(body.description);
    expect(movie.duration).toBe(body.duration);
  });

  it('should return NotFoundException when performing an operation on an invalid ID', async () => {
    try {
      await service.updatePartial(0, { title: 'Test' });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
    try {
      await service.remove(0);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('should order movies alphabetically with query', async () => {
    const findMovieParams = {
      orderBy: 'title',
    };
    const movieList = (await service.findAll(findMovieParams)).movies;
    for (let i = 1; i < movieList.length; i++) {
      expect(movieList[i - 1].title <= movieList[i].title).toBe(true);
    }
  });

  it('should order movies by oldest with query', async () => {
    const findMovieParams = {
      orderBy: 'oldest',
    };
    const movieList = (await service.findAll(findMovieParams)).movies;
    for (let i = 1; i < movieList.length; i++) {
      expect(movieList[i - 1].releaseYear <= movieList[i].releaseYear).toBe(
        true
      );
    }
  });

  it('should order movies by newest with query', async () => {
    const findMovieParams = {
      orderBy: 'newest',
    };
    const movieList = (await service.findAll(findMovieParams)).movies;
    for (let i = 1; i < movieList.length; i++) {
      expect(movieList[i - 1].releaseYear >= movieList[i].releaseYear).toBe(
        true
      );
    }
  });

  it('should order movies by highest with query', async () => {
    const findMovieParams = {
      orderBy: 'highest',
    };
    const movieList = (await service.findAll(findMovieParams)).movies;
    for (let i = 1; i < movieList.length; i++) {
      expect(movieList[i - 1].avgRating >= movieList[i].avgRating).toBe(true);
    }
  });

  it('should order movies by lowest with query', async () => {
    const findMovieParams = {
      orderBy: 'lowest',
    };
    const movieList = (await service.findAll(findMovieParams)).movies;
    for (let i = 1; i < movieList.length; i++) {
      expect(movieList[i - 1].avgRating <= movieList[i].avgRating).toBe(true);
    }
  });

  afterAll(async () => {
    for (let i = 0; i < newIds.length; i++) {
      await service.remove(newIds[i]);
    }
  });
});
