import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TodoQueryType, TodoResponseType } from './dto/todo.dto';
import { Todo } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prismaService: PrismaService) {}

  async create(title: string): Promise<Todo | undefined> {
    return await this.prismaService.todo.create({
      data: {
        title,
      },
    });
  }

  async getAll(queries: TodoQueryType): Promise<TodoResponseType | undefined> {
    const page = parseInt(queries.page?.toString()) || 1;
    const limit = parseInt(queries.limit?.toString()) || 10;
    const skip = page > 1 ? (page - 1) * limit : 0;
    const take = limit;
    const search = queries.search || '';
    // console.log('queries', queries);

    let where: any = {};
    if (search) {
      where = {
        title: {
          contains: search,
        },
      };
    }
    const todos = await this.prismaService.todo.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    // console.log('todos', todos);
    const totalTodos = await this.prismaService.todo.count({
      where,
    });
    const total = Math.ceil(totalTodos / limit);

    return {
      todos,
      page,
      total,
    };
  }
}
