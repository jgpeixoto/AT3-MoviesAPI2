import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly Service: AuthService) {}
  @Post('login')
  async login(@Body() body) {
    const email: string = body.email;
    const password: string = body.password;
    return this.Service.authenticateUser(email, password);
  }
}
