import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/auth.guard';
import { CanActivate } from '@nestjs/common';

describe('FileController', () => {
  let controller: FileController;
  let service: FileService;

  const mockAuthGuard: CanActivate = {
    canActivate: (): boolean => true,
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            exportUserMovies: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = moduleRef.get<FileController>(FileController);
    service = moduleRef.get<FileService>(FileService);
  });

  it('should export movies for authenticated user', async () => {
    const exportUserMoviesSpy = jest
      .spyOn(service, 'exportUserMovies')
      .mockResolvedValue({ message: 'Movies export generated' });

    const mockRequest = {
      user: {
        id: 1,
        email: 'user@test.com',
      },
    };

    const result = await controller.exportMovies(
      mockRequest as { user: { id: number; email: string } },
      { format: 'json' }
    );

    expect(exportUserMoviesSpy).toHaveBeenCalledWith(
      1,
      'user@test.com',
      'json'
    );

    expect(result).toEqual({
      message: 'Movies export generated',
    });
  });
});
