import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async create(user: User) {
    const userFound = await this.findByEmail(user.email);
    if (userFound !== null) {
      throw new BadRequestException('already exist a user with this email');
    }
    user.password = await this.authService.EncryptPassword(user.password);
    return this.prisma.user.create({ data: user });
  }

  async findAll() {
    return this.prisma.user.findMany({});
  }

  async findByID(id: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
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
