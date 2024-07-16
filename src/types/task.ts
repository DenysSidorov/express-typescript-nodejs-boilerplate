import { TodoType } from './todo';

export type TaskType = {
  id: string;
  name: string;
  date: string | Date;
  completed: boolean;
  todos: TodoType[];
};
