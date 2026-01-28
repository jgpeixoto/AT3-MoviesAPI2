import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findByID(+id);
    const { password: ocultPassword, ...safeUser } = user;
    return safeUser;
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Patch()
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user;
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete()
  remove(@Req() req) {
    const user = req.user;
    return this.usersService.remove(user.id);
  }
}
