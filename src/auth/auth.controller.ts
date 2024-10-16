import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(data.name, data.email, data.password);
  }

  @Post('login')
  login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = this.authService.validateUser(data.email, data.password);
    return this.authService.getTokens(user, response);
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(request, response);
  }

  @Post('refresh')
  async refresh(@Req() request: Request) {
    return this.authService.refreshToken(request);
  }
}
