import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly Service: AuthService) {}
  @Post('login')
  login(@Body() body) {
    if (body.user === 'luiz' && body.password === '123') {
      //esse teste seria feito no banco
      //auth ok
      const id = 1; //esse id viria do banco de dados
      const token = this.Service.createToken(id);
      return { auth: true, token: token };
    }
    throw new UnauthorizedException('Erro ao fazer login');
  }

  @UseGuards(AuthGuard)
  @Get('all')
  getall() {
    return 'Lanche';
  }
}
