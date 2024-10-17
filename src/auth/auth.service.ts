import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import e, { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { decrypt, encrypt } from 'src/utils/bcrypt';

interface JwtPayload {
  id: string;
}
interface IUser {
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  register = async (name: string, email: string, password: string) => {
    //step 1: check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    //step 2: hash password
    const hashedPassword = await encrypt(password);

    //step 3: create user
    await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    //step 4: return user
    return { message: 'User registered successfully' };
  };

  validateUser = async (email: string, password: string) => {
    //step 1: check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await decrypt(password, user.password))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    //step 3: return user
    return user;
  };

  getTokens = async (user, response: Response) => {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    await this.userService.insertRefreshToken(user.id, refreshToken);
    response
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  };

  refreshToken = async (request: Request) => {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('refresh_token_not_provided');
    }
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('jwt.refresh_token_secret'),
    });
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
    });
    const decryptedRefreshToken = await decrypt(
      refreshToken,
      user.refreshToken,
    );
    if (decryptedRefreshToken) {
      return {
        accessToken: await this.createAccessToken(user),
      };
    } else {
      throw new UnauthorizedException('invalid_refresh_token');
    }
  };

  logout = async (request: Request, response: Response) => {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('refresh_token_not_provided');
    }
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('jwt.refresh_token_secret'),
    });
    await this.prismaService.user.update({
      where: {
        id: payload.id,
      },
      data: {
        refreshToken: null,
      },
    });
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'success' };
  };

  private createAccessToken = async (user: IUser) => {
    const payload: JwtPayload = { id: user.id };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access_token_secret'),
      expiresIn: this.configService.get('jwt.access_token_expiration'),
    });
  };

  private createRefreshToken = async (user: IUser) => {
    const payload: JwtPayload = { id: user.id };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refresh_token_secret'),
      expiresIn: this.configService.get('jwt.refresh_token_expiration'),
    });
  };
}
