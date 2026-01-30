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
import { RequestWithUser } from 'src/common/request-with-user.interface';
import { ForgetPasswordDTO } from './dto/forget-password.dto';

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
  findOne(@Param('id') id: string) {
    return this.usersService.findByID(+id);
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Patch()
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user;
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete()
  remove(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.usersService.remove(user.id);
  }

  @Post('request')
  request(@Body() body: { email: string }) {
    return this.usersService.request(body.email);
  }

  @UsePipes(ValidationPipe)
  @Patch('forget')
  forgetPassword(@Body() forgetPassword: ForgetPasswordDTO) {
    return this.usersService.forgetPassword(forgetPassword);
  }
}
