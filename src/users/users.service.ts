import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgetPasswordDTO } from './dto/forget-password.dto';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async create(CreateUserDto: CreateUserDto) {
    this.logger.log('Creating user (checking email uniqueness)');
    const userFound = await this.findByEmail(CreateUserDto.email);
    if (userFound) {
      throw new BadRequestException('already exist a user with this email');
    }
    CreateUserDto.password = await this.authService.EncryptPassword(
      CreateUserDto.password
    );
    return this.prisma.user.create({ data: CreateUserDto });
  }

  async findAll() {
    this.logger.log('Fetching all users from the database');
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findByID(id: number) {
    if (!id) {
      throw new BadRequestException('Invalid id');
    }
    this.logger.log(`Fetching user by id: ${id}`);
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new BadRequestException('invalid email');
    }
    this.logger.log(`Fetching user by email: ${email}`);
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user password for id: ${id}`);
    const user = await this.findByID(id);
    if (!user) {
      throw new NotFoundException('user not found exception');
    }
    user.password = await this.authService.EncryptPassword(
      updateUserDto.password
    );
    return this.prisma.user.update({
      where: { id },
      data: user,
    });
  }

  async remove(id: number) {
    this.logger.log(`Deleting user with id: ${id}`);
    await this.prisma.user.delete({ where: { id } });
    return { deletedUserID: id };
  }

  async request(email: string) {
    this.logger.log('Requesting password reset email');
    return this.authService.sendResetTokenEmail(email);
  }

  async forgetPassword(forgetPasswordDTO: ForgetPasswordDTO) {
    const userEmail = forgetPasswordDTO.email;
    this.logger.log(`Changing password for email: ${userEmail}`);
    await this.authService.verifyResetJwt(forgetPasswordDTO.token, userEmail);

    const user = await this.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const newPassword = await this.authService.EncryptPassword(
      forgetPasswordDTO.password
    );

    return this.prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });
  }
}
