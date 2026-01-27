import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async create(user: User) {
    this.logger.log('Creating user (checking email uniqueness)');
    const userFound = await this.findByEmail(user.email);
    if (userFound !== null) {
      throw new BadRequestException('already exist a user with this email');
    }
    user.password = await this.authService.EncryptPassword(user.password);
    return this.prisma.user.create({ data: user });
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
    this.logger.log(`Fetching user by id: ${id}`);
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findByEmail(email: string) {
    this.logger.log(`Fetching user by email: ${email}`);
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user password for id: ${id}`);
    const user = await this.findByID(id);
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
    try {
      await this.prisma.user.delete({ where: { id } });
      return { deletedUserID: id };
    } catch (error) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      } else throw error;
    }
  }
}
