import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
}
