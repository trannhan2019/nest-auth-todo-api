import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PrismaService, TodoService],
  controllers: [TodoController],
})
export class TodoModule {}
