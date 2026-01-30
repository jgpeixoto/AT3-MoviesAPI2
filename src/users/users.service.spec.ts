import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let authService: {
    EncryptPassword: jest.Mock;
    sendResetTokenEmail: jest.Mock;
    verifyResetJwt: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    authService = {
      EncryptPassword: jest.fn(),
      sendResetTokenEmail: jest.fn(),
      verifyResetJwt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user when email is unique', async () => {
      const inputUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plain123',
      };
      prisma.user.findUnique.mockResolvedValue(null);
      authService.EncryptPassword.mockResolvedValue('hashed123');
      prisma.user.create.mockResolvedValue({
        id: 1,
        ...inputUser,
        password: 'hashed123',
      });

      const result = await service.create({ ...inputUser });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: inputUser.email },
      });
      expect(authService.EncryptPassword).toHaveBeenCalledWith('plain123');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...inputUser, password: 'hashed123' },
      });
      expect(result.password).toBe('hashed123');
    });

    it('should throw BadRequestException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 99 });
      const inputUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plain123',
      };

      await expect(service.create(inputUser)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(authService.EncryptPassword).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users without password fields', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 1, name: 'A', email: 'a@a.com' },
        { id: 2, name: 'B', email: 'b@b.com' },
      ]);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, email: true },
      });
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should propagate errors from prisma findMany', async () => {
      const error = new Error('db error');
      prisma.user.findMany.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('db error');
    });
  });

  describe('findByID', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'A', email: 'a@a.com', password: 'hash' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByID(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByID(1);

      expect(result).toBeNull();
    });

    it('should throw BadRequestException when id is invalid', async () => {
      await expect(service.findByID(0)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, name: 'A', email: 'a@a.com', password: 'hash' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('a@a.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@a.com' },
      });
      expect(result).toEqual(user);
    });

    it('should throw BadRequestException when email is invalid', async () => {
      await expect(service.findByEmail('')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('should propagate errors from prisma findUnique', async () => {
      const error = new Error('db error');
      prisma.user.findUnique.mockRejectedValue(error);

      await expect(service.findByEmail('a@a.com')).rejects.toThrow('db error');
    });
  });

  describe('update', () => {
    it('should update user password with hashed value', async () => {
      const existingUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldhash',
      };
      prisma.user.findUnique.mockResolvedValue({ ...existingUser });
      authService.EncryptPassword.mockResolvedValue('newhash');
      prisma.user.update.mockResolvedValue({
        ...existingUser,
        password: 'newhash',
      });

      const result = await service.update(1, { password: 'newpass' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(authService.EncryptPassword).toHaveBeenCalledWith('newpass');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...existingUser, password: 'newhash' },
      });
      expect(result.password).toBe('newhash');
    });

    it('should propagate errors when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { password: 'newpass' })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException when id is invalid', async () => {
      await expect(
        service.update(0, { password: 'newpass' })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a user and return the deleted id', async () => {
      prisma.user.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ deletedUserID: 1 });
    });

    it('should propagate errors from prisma delete', async () => {
      const error = { code: 'P2025' };
      prisma.user.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toEqual(error);
    });
  });

  describe('request', () => {
    it('should call authService to send reset token email', async () => {
      authService.sendResetTokenEmail.mockResolvedValue({
        messageId: 'msg-1',
        previewUrl: 'http://test',
      });

      const result = await service.request('test@example.com');

      expect(authService.sendResetTokenEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(result).toEqual({
        messageId: 'msg-1',
        previewUrl: 'http://test',
      });
    });
  });

  describe('forgetPassword', () => {
    it('should verify token, hash password, and update user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'newpass',
        token: 'Bearer token',
      };
      authService.verifyResetJwt.mockResolvedValue({ email: dto.email });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'User',
        email: dto.email,
        password: 'oldhash',
      });
      authService.EncryptPassword.mockResolvedValue('newhash');
      prisma.user.update.mockResolvedValue({
        id: 1,
        name: 'User',
        email: dto.email,
        password: 'newhash',
      });

      const result = await service.forgetPassword(dto);

      expect(authService.verifyResetJwt).toHaveBeenCalledWith(
        dto.token,
        dto.email
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(authService.EncryptPassword).toHaveBeenCalledWith(dto.password);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newhash' },
      });
      expect(result.password).toBe('newhash');
    });

    it('should throw NotFoundException when user is not found', async () => {
      const dto = {
        email: 'missing@example.com',
        password: 'newpass',
        token: 'Bearer token',
      };
      authService.verifyResetJwt.mockResolvedValue({ email: dto.email });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.forgetPassword(dto)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('should propagate errors from verifyResetJwt', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'newpass',
        token: 'Bearer token',
      };
      const error = new Error('invalid token');
      authService.verifyResetJwt.mockRejectedValue(error);

      await expect(service.forgetPassword(dto)).rejects.toThrow(
        'invalid token'
      );
    });
  });
});
