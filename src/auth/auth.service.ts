import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

  async checkToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.service.verifyAsync(token.replace('Bearer ', ''));
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  async EncryptPassword(password: string) {
    try {
      return bcrypt.hash(password, 10);
    } catch (error) {
      const errorMessage: string = error.message;
      throw new Error(errorMessage);
    }
  }

  async ComparePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    try {
      return bcrypt.compare(password, userPassword);
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
    return { user: user, token: token };
  }
}
