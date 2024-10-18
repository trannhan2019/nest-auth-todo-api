import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() request: Request) {
    const id = request['user'].id;

    return this.userService.getProfile(id);
    // return 'hello';
  }
}
