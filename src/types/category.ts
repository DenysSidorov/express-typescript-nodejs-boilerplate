import { TaskType } from './task';

export type AllCategoryTypes = CategoryListType | CategoryCountType;
export interface CategoryType {
  id: string;
  type: CategoryTypes;
  title: string;
  color: string;
  date: string | Date;
  tasks?: TaskType[];
  goalCount?: number;
  currentCount?: number;
}

export interface CategoryListType extends CategoryType {
  tasks: TaskType[];
}

export interface CategoryCountType extends CategoryType {
  goalCount: number;
  currentCount: number;
  tasks?: TaskType[];
};

type CategoryTypes = 'list' | 'count';
