import { Test, TestingModule } from '@nestjs/testing';
import { FileModule } from './file.module';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('FileModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [FileModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should provide FileService', () => {
    const service = moduleRef.get<FileService>(FileService);
    expect(service).toBeInstanceOf(FileService);
  });

  it('should provide FileController', () => {
    const controller = moduleRef.get<FileController>(FileController);
    expect(controller).toBeInstanceOf(FileController);
  });

  it('should provide PrismaService', () => {
    const prisma = moduleRef.get<PrismaService>(PrismaService);
    expect(prisma).toBeInstanceOf(PrismaService);
  });
});
