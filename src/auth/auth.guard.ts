/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const payload = await this.authService.checkToken(token ?? '');
    request.user = payload;
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const auth =
      request.headers['authorization'] || request.headers['Authorization'];
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
