import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let prisma: { user: { findUniqueOrThrow: jest.Mock } };

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    prisma = {
      user: {
        findUniqueOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createToken', () => {
    it('should return a signed token', async () => {
      jwtService.signAsync.mockResolvedValue('token123');

      const result = await service.createToken(1, 'test@example.com');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
      });
      expect(result).toBe('token123');
    });
  });

  describe('checkToken', () => {
    it('should verify a token and return the payload', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.checkToken('Bearer valid.token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new TokenExpiredError('jwt expired', new Date())
      );

      await expect(service.checkToken('Bearer expired')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new JsonWebTokenError('invalid token')
      );

      await expect(service.checkToken('Bearer invalid')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for unknown errors', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('unexpected'));

      await expect(service.checkToken('Bearer any')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });
  });

  describe('EncryptPassword', () => {
    it('should hash the password with bcrypt', async () => {
      const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
      bcryptMock.hash.mockResolvedValue('hashed');

      const result = await service.EncryptPassword('plain');

      expect(bcryptMock.hash).toHaveBeenCalledWith('plain', 10);
      expect(result).toBe('hashed');
    });
  });

  describe('ComparePassword', () => {
    it('should return true when passwords match', async () => {
      const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
      bcryptMock.compare.mockResolvedValue(true);

      const result = await service.ComparePassword('plain', 'hashed');

      expect(bcryptMock.compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when bcrypt fails', async () => {
      const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
      bcryptMock.compare.mockRejectedValue(new Error('bcrypt error'));

      await expect(
        service.ComparePassword('plain', 'hashed')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user and return token without password', async () => {
      const user = {
        id: 1,
        name: 'User',
        email: 'test@example.com',
        password: 'hashed',
      };
      prisma.user.findUniqueOrThrow.mockResolvedValue(user);
      jest.spyOn(service, 'ComparePassword').mockResolvedValue(true);
      jest.spyOn(service, 'createToken').mockResolvedValue('token123');

      const result = await service.authenticateUser(
        'test@example.com',
        'plain'
      );

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(service.ComparePassword).toHaveBeenCalledWith('plain', 'hashed');
      expect(service.createToken).toHaveBeenCalledWith(1, 'test@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('token123');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        name: 'User',
        email: 'test@example.com',
        password: 'hashed',
      });
      jest.spyOn(service, 'ComparePassword').mockResolvedValue(false);

      await expect(
        service.authenticateUser('test@example.com', 'wrong')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw NotFoundException when user is not found', async () => {
      prisma.user.findUniqueOrThrow.mockRejectedValue(
        new NotFoundException('not found')
      );

      await expect(
        service.authenticateUser('missing@example.com', 'plain')
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
