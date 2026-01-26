import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';

describe('FileController', () => {
  let controller: FileController;
  let service: FileService;

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
    }).compile();

    controller = moduleRef.get<FileController>(FileController);
    service = moduleRef.get<FileService>(FileService);
  });

  it('should export user movies', async () => {
    const exportUserMoviesSpy = jest
      .spyOn(service, 'exportUserMovies')
      .mockResolvedValue({ message: 'Movies export generated' });

    const result = await controller.exportMovies({ format: 'json' });

    expect(exportUserMoviesSpy).toHaveBeenCalledWith(
      1,
      'test@test.com',
      'json'
    );

    expect(result).toEqual({
      message: 'Movies export generated',
    });
  });
});
