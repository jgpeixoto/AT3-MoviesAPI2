import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
  getTestMessageUrl: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock; findUniqueOrThrow: jest.Mock } };
  const envBackup = { ...process.env };

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    prisma = {
      user: {
        findUnique: jest.fn(),
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
    process.env = { ...envBackup };
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

  describe('createResetJwt', () => {
    it('should return a signed reset token', async () => {
      jwtService.signAsync.mockResolvedValue('resetToken');

      const result = await service.createResetJwt('test@example.com');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        purpose: 'reset',
      });
      expect(result).toBe('resetToken');
    });
  });

  describe('verifyResetJwt', () => {
    it('should verify a reset token and return payload', async () => {
      const payload = { email: 'test@example.com', purpose: 'reset' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyResetJwt(
        'Bearer reset.token',
        'test@example.com'
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('reset.token');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException when purpose is not reset', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        email: 'test@example.com',
        purpose: 'login',
      });

      await expect(
        service.verifyResetJwt('Bearer reset.token', 'test@example.com')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email does not match', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        email: 'other@example.com',
        purpose: 'reset',
      });

      await expect(
        service.verifyResetJwt('Bearer reset.token', 'test@example.com')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new TokenExpiredError('jwt expired', new Date())
      );

      await expect(
        service.verifyResetJwt('Bearer expired', 'test@example.com')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new JsonWebTokenError('invalid token')
      );

      await expect(
        service.verifyResetJwt('Bearer invalid', 'test@example.com')
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown errors', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('unexpected'));

      await expect(
        service.verifyResetJwt('Bearer any', 'test@example.com')
      ).rejects.toBeInstanceOf(UnauthorizedException);
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
      prisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(service, 'ComparePassword').mockResolvedValue(true);
      jest.spyOn(service, 'createToken').mockResolvedValue('token123');

      const result = await service.authenticateUser(
        'test@example.com',
        'plain'
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(service.ComparePassword).toHaveBeenCalledWith('plain', 'hashed');
      expect(service.createToken).toHaveBeenCalledWith(1, 'test@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('token123');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
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
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.authenticateUser('missing@example.com', 'plain')
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('sendResetTokenEmail', () => {
    it('should send reset token email and return messageId with previewUrl', async () => {
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_USER = 'user@test.com';
      process.env.SMTP_PASS = 'pass123';
      process.env.SMTP_PORT = '2525';

      const nodemailerMock = nodemailer;
      const transporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-123' }),
      };
      nodemailerMock.createTransport.mockReturnValue(
        transporter as unknown as nodemailer.Transporter
      );
      nodemailerMock.getTestMessageUrl.mockReturnValue(
        'https://preview.test/abc'
      );
      jest.spyOn(service, 'createResetJwt').mockResolvedValue('resetToken');

      const result = await service.sendResetTokenEmail('test@example.com');

      expect(service.createResetJwt).toHaveBeenCalledWith('test@example.com');
      expect(nodemailerMock.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 2525,
        secure: false,
        auth: { user: 'user@test.com', pass: 'pass123' },
      });
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: '"Movies API" <no-reply@movies.com>',
        to: 'test@example.com',
        subject: 'Password reset',
        text: expect.stringContaining('resetToken'),
        html: expect.stringContaining('resetToken'),
      });
      expect(result).toEqual({
        messageId: 'msg-123',
        previewUrl: 'https://preview.test/abc',
      });
    });

    it('should return previewUrl undefined when nodemailer has no preview', async () => {
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_USER = 'user@test.com';
      process.env.SMTP_PASS = 'pass123';
      process.env.SMTP_PORT = '2525';

      const nodemailerMock = nodemailer;
      const transporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-999' }),
      };
      nodemailerMock.createTransport.mockReturnValue(
        transporter as unknown as nodemailer.Transporter
      );
      nodemailerMock.getTestMessageUrl.mockReturnValue(null);
      jest.spyOn(service, 'createResetJwt').mockResolvedValue('resetToken');

      const result = await service.sendResetTokenEmail('test@example.com');

      expect(result).toEqual({
        messageId: 'msg-999',
        previewUrl: undefined,
      });
    });
  });
});
