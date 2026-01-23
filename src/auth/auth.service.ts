import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// interface JwtPayload {
//   id: number;
// }
@Injectable()
export class AuthService {
  constructor(private readonly service: JwtService) {}

  createToken(id: number): string {
    return this.service.sign({ id }) as string;
  }

  checkToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.service.verify(token.replace('Bearer ', ''));
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  EncryptPassword(password: string) {
    try {
      return bcrypt.hash(password, 10);
    } catch (error) {
      throw new Error(error);
    }
  }

  ComparePassword(password: string, userPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, userPassword);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
