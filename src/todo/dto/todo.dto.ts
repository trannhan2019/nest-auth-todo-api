import { Todo } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  title: string;
}
export interface TodoQueryType {
  page: number;
  limit: number;
  search: string;
}

export interface TodoResponseType {
  todos: Todo[];
  page: number;
  total: number;
}
