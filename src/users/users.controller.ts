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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() user: User) {
    return this.usersService.create(user);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByID(+id);
  }

  @UseGuards(AuthGuard)
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
