import { data } from '../data/todos';
import { TaskType } from '../types/task';

export const getCategoryById = (id: string | number) => {
  return data.categories.find((el) => String(el.id) === String(id));
};

export const getTaskById = (categoryTasks: TaskType[] | undefined, taskId: string | number): TaskType | undefined => {
  if (categoryTasks) {
    return categoryTasks.find((el: TaskType) => String(el.id) === String(taskId));
  }
};

export const getCategoryWithIndex = (categoryId: string | number) => {
  let indexCategory = -1;
  let category = undefined;

  category = data.categories.find((el, index) => {
    if (String(el.id) === String(categoryId)) {
      indexCategory = index;
      return true;
    }
    return false;
  });

  return { category, indexCategory };
};

export const getTaskWithIndex = (categoryTasks: TaskType[], taskId: string | number) => {
  let indexTask = -1;
  let task: TaskType | undefined = undefined;

  task = categoryTasks.find((el: TaskType, index: number) => {
    if (String(el.id) === String(taskId)) {
      indexTask = index;
      return true;
    }
    return false;
  });

  return { task, indexTask };
};
