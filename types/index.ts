export interface DayType {
  dateString: string;
  day: number;
  month: number;
  timestamp: number;
  year: number;
}

export type MarkedDate = {
  day: string;
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  activeOpacity?: number;
  disabled?: boolean;
  disableTouchEvent?: boolean;
};

export type MarkedDates = {
  [key: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dotColor?: string;
    activeOpacity?: number;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  };
};

export interface TodoListType {
  id?: number;
  text: string;
  completed: boolean;
  date: DayType;
  color: string;
}

export interface TodoListStateType {
  day: string;
  selected: boolean;
  selectedColor: string;
}
