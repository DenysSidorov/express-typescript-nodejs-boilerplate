import express from 'express';
// import logger from '../utils/logger';
import { healthCheck } from '../handlers/healthcheck';
import { data } from '../data/todos';
import { TaskType } from '../types/task';
import { TodoType } from '../types/todo';
import { getCurrentDateTimeFormatted } from '../utils/dates';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);
router.get('/api/categories', (_, res) => {
  res.send(data);
});
router.get('/api/categories/:id', (req, res) => {
  const id: string = req.params.id;
  const category = data.categories.find((el) => el.id === id);
  res.send(category || {});
});
router.get('/api/categories/:categoryId/tasks ', (req, res) => {
  const id: string = req.params.categoryId;
  const category = data.categories.find((el) => el.id === id);
  res.send(category || {});
});

router.get('/api/categories/:categoryId/tasks/:taskId/todos', (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;
  let todos: TodoType[] = [];
  const category = data.categories.find((el) => el.id === categoryId);
  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const task: TaskType | undefined = categoryTasks.find((el: TaskType) => el.id === taskId);
      if (task) {
        todos = task?.todos || [];
      }
      console.log(task);
    }
    // const todos = category?.tasks?.find((el: TaskType) => el.id === taskId);
    // console.log(tasks);
  }
  res.send(todos);
});

router.post('/api/categories/:categoryId/tasks/:taskId/todos', async (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;
  const { text } = req.body;

  let result = false;

  let indexCategory = -1;
  let indexTask = -1;

  const category = data.categories.find((el, index) => {
    if (el.id === categoryId) {
      indexCategory = index;
      return true;
    }
    return false;
  });
  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const task: TaskType | undefined = categoryTasks.find((el: TaskType, index: number) => {
        if (el.id === taskId) {
          indexTask = index;
          return true;
        }
        return false;
      });
      if (task) {
        const newTodo = {
          id: Date.now().toString(),
          name: text,
          date: getCurrentDateTimeFormatted(),
          completed: false,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data?.categories[indexCategory]?.tasks[indexTask]?.todos) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          data.categories[indexCategory].tasks[indexTask].todos.push(newTodo);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          data.categories[indexCategory].tasks[indexTask].todos = [newTodo];
        }
        result = true;
      }
    }
  }
  res.send(result);
});

router.patch('/api/categories/:id', (req, res) => {
  const id: string = req.params.id;
  const { status, idTask } = req.body;
  const category = data.categories.find((el) => el.id === id);

  if (category) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const task = category?.tasks?.find((task: TaskType) => task.id === idTask);
    if (task) {
      task.completed = status;
      if (task?.todos?.length > 0) {
        task.todos = task.todos.map((task: TaskType) => ({ ...task, completed: status }));
      }
      res.send(category);
    } else {
      res.status(400).json({ message: `No Task (id: ${idTask}) in Category (id: ${id})` });
    }
  } else {
    res.status(400).json({ message: `No Category with id: ${id}` });
  }
});

export default router;
