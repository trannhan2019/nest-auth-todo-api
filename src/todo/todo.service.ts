import { Injectable } from '@nestjs/common';
import { Todo } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prismaService: PrismaService) {}

  async getAll(): Promise<Todo[]> {
    return this.prismaService.todo.findMany();
  }
}
