import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UsersMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.method === 'POST') {
      this.verifiyPost(req.body);
    }
    if (req.method === 'PATCH') {
      this.verifyPatch(req.body);
    }
    next();
  }

  private verifiyPost(user: User) {
    if (!user) {
      throw new BadRequestException('request body is required');
    }
    if (!user.name) {
      throw new BadRequestException('name cant be empty');
    }
    if (!user.email) {
      throw new BadRequestException('email cant be empty');
    }
    if (!user.password) {
      throw new BadRequestException('password cant be empty');
    }
    if (user.password.length < 6) {
      throw new BadRequestException('password must be greather than 6 digits');
    }
    return user;
  }

  private verifyPatch(user: User) {
    if (user.password.length < 6) {
      throw new BadRequestException('password must be greather than 6 digits');
    }
    return user;
  }
}
