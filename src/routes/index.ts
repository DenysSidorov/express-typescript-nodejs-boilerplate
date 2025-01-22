import express from 'express';
// import logger from '../utils/logger';
import randomColor from 'randomcolor';
import { uniqueNamesGenerator, Config, animals } from 'unique-names-generator';
import { healthCheck } from '../handlers/healthcheck';
import { data } from '../data/todos';
import { TodoType } from '../types/todo';
import { getCurrentDateTimeFormatted } from '../utils/dates';
import { getCategoryById, getCategoryWithIndex, getTaskById, getTaskWithIndex } from './helpers';

const config: Config = {
  dictionaries: [animals],
};

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);

router.get('/api/categories', (_, res) => {
  res.send(data);
});

router.get('/api/categories/:id', (req, res) => {
  const id: string = req.params.id;
  const category = getCategoryById(id);
  res.send(category || {});
});

router.get('/api/categories/:categoryId/tasks ', (req, res) => {
  const id: string = req.params.categoryId;
  const category = getCategoryById(id);
  res.send(category || {});
});

router.get('/api/categories/:categoryId/tasks/:taskId/todos', (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;
  let todos: TodoType[] = [];
  const category = getCategoryById(categoryId);
  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const task = getTaskById(categoryTasks, taskId);
      if (task) {
        todos = task?.todos || [];
      }
    }
  }
  res.send(todos);
});

router.post('/api/categories', async (_, res) => {
  const uniqName = uniqueNamesGenerator(config);
  const newCategory = {
    id: Date.now().toString(),
    type: 'list',
    title: uniqName.charAt(0).toUpperCase() + uniqName.substring(1),
    tasks: [],
    date: getCurrentDateTimeFormatted(),
    color: randomColor(),
  };
  data.categories.push(newCategory);
  res.send(newCategory);
});

router.post('/api/categories/:categoryId/tasks', async (req, res) => {
  const categoryId: string = req.params.categoryId;
  const { title, todos } = req.body;
  console.log(title, todos);

  const category = getCategoryById(categoryId);

  if (category) {
    const newTask = {
      id: Date.now().toString(),
      name: title,
      date: getCurrentDateTimeFormatted(),
      todos,
    };
    if (category.tasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      category.tasks.push(newTask);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      category.tasks = [newTask];
    }
    res.send(true);
  } else {
    res.status(400).json({ message: `No Category with id: ${categoryId}` });
  }
});

router.post('/api/categories/:categoryId/tasks/:taskId/todos', async (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;
  const { text } = req.body;
  let result = false;
  const { category, indexCategory } = getCategoryWithIndex(categoryId);

  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { task, indexTask } = getTaskWithIndex(categoryTasks, taskId);

      if (task) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data?.categories[indexCategory]?.tasks[indexTask]?.completed = false;
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
  const { title } = req.body;
  const category = getCategoryById(id);

  if (category) {
    category.title = title;
    res.send(category);
  } else {
    res.status(400).json({ message: `No Category with id: ${id}` });
  }
});

router.patch('/api/categories/:id/tasks/:idTask', (req, res) => {
  const id: string = req.params.id;
  const idTask: string = req.params.idTask;
  const { status } = req.body;
  const category = getCategoryById(id);

  if (category) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const task = getTaskById(category.tasks, idTask);
    if (task) {
      task.completed = status;
      if (task?.todos?.length > 0) {
        task.todos = task.todos.map((todo: TodoType) => ({ ...todo, completed: status }));
      }
      res.send(category);
    } else {
      res.status(400).json({ message: `No Task (id: ${idTask}) in Category (id: ${id})` });
    }
  } else {
    res.status(400).json({ message: `No Category with id: ${id}` });
  }
});

//ok
router.delete('/api/categories/:categoryId/tasks/:taskId/todo', async (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;
  const { idTodo } = req.body;

  let result = false;

  const { category, indexCategory } = getCategoryWithIndex(categoryId);

  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { task, indexTask } = getTaskWithIndex(categoryTasks, taskId);
      if (task) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data?.categories[indexCategory]?.tasks[indexTask]?.todos) {
          let deletedIndex = -1;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const newTodos = data.categories[indexCategory].tasks[indexTask].todos.filter((todo, index) => {
            if (todo.id !== idTodo) {
              return true;
            } else {
              deletedIndex = index;
              return false;
            }
          });
          if (deletedIndex !== -1) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            data.categories[indexCategory].tasks[indexTask].todos = newTodos;
            result = true;
          }
        } else {
          result = false;
        }
      }
    }
  }
  res.send(result);
});

router.patch('/api/categories/:categoryId/tasks/:taskId/todo', (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;

  const { status, idTask, idTodo } = req.body;
  const category = getCategoryById(categoryId);

  if (category) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const task = getTaskById(category.tasks, taskId);
    if (task) {
      let isStatusChanged = false;
      if (task?.todos?.length > 0) {
        task.todos = task.todos.map((todo: TodoType) => {
          if (String(todo.id) === String(idTodo)) {
            isStatusChanged = true;
            return { ...todo, completed: status };
          }
          return { ...todo };
        });
      }
      res.send(isStatusChanged);
    } else {
      res.status(400).json({ message: `No Task (id: ${idTask}) in Category (id: ${categoryId})` });
    }
  } else {
    res.status(400).json({ message: `No Category with id: ${categoryId}` });
  }
});

router.delete('/api/categories/:id', async (req, res) => {
  const categoryId: string = req.params.id;
  const { category, indexCategory } = getCategoryWithIndex(categoryId);
  if (category) {
    let isRemoved = false;
    data.categories = data.categories.filter((_, ind) => {
      if (String(ind) === String(indexCategory)) {
        isRemoved = true;
      }
      return ind !== indexCategory;
    });
    res.send(isRemoved);
  } else {
    res.status(400).json({ message: `No Category with id: ${categoryId}` });
  }
});

router.delete('/api/categories/:categoryId/tasks/:taskId', async (req, res) => {
  const categoryId: string = req.params.categoryId;
  const taskId: string = req.params.taskId;

  let result = false;

  const { category, indexCategory } = getCategoryWithIndex(categoryId);

  if (category) {
    const categoryTasks = category?.tasks;
    if (categoryTasks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { task, indexTask } = getTaskWithIndex(categoryTasks, taskId);

      if (task) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        if (data?.categories[indexCategory]?.tasks[indexTask]) {
          let isRemoved = false;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          data.categories[indexCategory].tasks = data.categories[indexCategory].tasks?.filter((el, ind) => {
            if (String(ind) === String(indexTask)) {
              isRemoved = true;
            }
            return ind !== indexTask;
          });

          if (isRemoved) {
            result = true;
          }
        } else {
          result = false;
        }
      }
    }
  }
  res.send(result);
});

export default router;
console.log(1 + 1);
