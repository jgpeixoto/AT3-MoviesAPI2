import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly service: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async createToken(id: number, email: string): Promise<string> {
    return this.service.signAsync({ id, email });
  }

  async checkToken(token: string): Promise<any> {
    try {
      return await this.service.verifyAsync(token.replace('Bearer ', ''));
    } catch (err: any) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('token expired');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('invalid token');
      }
      throw new UnauthorizedException('invalid token');
    }
  }

  async EncryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async ComparePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, userPassword);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { email } });
    if (!user) {
      throw new NotFoundException(`user with EMAIL: ${email} not found`);
    }

    const userAproved = await this.ComparePassword(password, user.password);
    if (!userAproved) {
      throw new UnauthorizedException('invalid credentials');
    }
    const token = await this.createToken(user.id, user.email);
    const { password: ocultPassword, ...safeUser } = user;
    return { user: safeUser, token: token };
  }
}
