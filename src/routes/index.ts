import express from 'express';
// import logger from '../utils/logger';
import { healthCheck } from '../handlers/healthcheck';
import { data } from '../data/todos';
import { TaskType } from '../types/task';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);
router.get('/api/categories', (_, res) => {
  res.send(data);
});
router.get('/api/categories/:id', (req, res) => {
  const id: string = req.params.id;
  res.send(data.categories.find((el) => el.id === id));
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
      if (task.todos.length > 0) {
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
