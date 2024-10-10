import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto, TodoQueryType, TodoResponseType } from './dto/todo.dto';
import { Todo } from '@prisma/client';

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  getTodos(@Query() queries: TodoQueryType): Promise<TodoResponseType> {
    return this.todoService.getAll(queries);
  }

  @Post()
  createTodo(@Body() data: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(data.title);
  }
}
