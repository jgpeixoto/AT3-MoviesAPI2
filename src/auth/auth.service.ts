import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly service: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async createToken(id: number, email: string): Promise<string> {
    this.logger.log('Creating JWT token');
    return this.service.signAsync({ id, email });
  }

  async createResetJwt(email: string): Promise<string> {
    this.logger.log('Creating reset JWT token');
    return this.service.signAsync({ email, purpose: 'reset' });
  }

  async checkToken(token: string): Promise<any> {
    this.logger.log('Verifying JWT token');
    try {
      return await this.service.verifyAsync(token.replace('Bearer ', ''));
    } catch (err: any) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Expired token');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyResetJwt(token: string, email: string) {
    this.logger.log('Verifying reset JWT token');
    try {
      const payload = await this.service.verifyAsync(
        token.replace('Bearer ', '')
      );

      if (payload.purpose !== 'reset') {
        throw new UnauthorizedException('Invalid token');
      }

      if (payload.email !== email) {
        throw new UnauthorizedException('Invalid token');
      }
      return payload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Expired token');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async EncryptPassword(password: string): Promise<string> {
    this.logger.log('Encrypting password');
    return await bcrypt.hash(password, 10);
  }

  async ComparePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    try {
      this.logger.log('Comparing passwords');
      return await bcrypt.compare(password, userPassword);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async authenticateUser(email: string, password: string) {
    this.logger.log('Authenticating user');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `User with e-mail address ${email} not found`
      );
    }

    const userAproved = await this.ComparePassword(password, user.password);
    if (!userAproved) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.createToken(user.id, user.email);
    const { password: ocultPassword, ...safeUser } = user;
    return { user: safeUser, token: token };
  }

  private async createEtherealTransporter(): Promise<nodemailer.Transporter> {
    this.logger.log('Creating Ethereal transporter');
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);

    return await nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendResetTokenEmail(email: string) {
    this.logger.log('Sending reset email');
    const token = await this.createResetJwt(email);
    const transporter = await this.createEtherealTransporter();

    const info = await transporter.sendMail({
      from: '"Movies API" <no-reply@movies.com>',
      to: email,
      subject: 'Password reset',
      text: `Use this token to reset your password: ${token}`,
      html: `<p>Use this token to reset your password:</p><p><strong>${token}</strong></p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) ?? undefined;
    if (previewUrl) {
      this.logger.log(`Ethereal preview URL: ${previewUrl}`);
    }

    return { messageId: info.messageId, previewUrl };
  }
}
