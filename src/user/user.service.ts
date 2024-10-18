import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { encrypt } from 'src/utils/bcrypt';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async insertRefreshToken(id: string, refreshToken: string) {
    const userToInsert = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    userToInsert.refreshToken = await encrypt(refreshToken);
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: userToInsert.refreshToken,
      },
    });
  }
}
