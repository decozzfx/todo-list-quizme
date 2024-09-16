import { TodoListType } from "@/types";
import getRandomColor from "@/utils/randomColors";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: TodoListType[] = [];

export const todoListSlice = createSlice({
  name: "todolist",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<TodoListType>) => {
      state.push({
        ...action.payload,
        color: getRandomColor(),
        id: state.length + 1,
      });
    },
    deleteTodo: (state, action: PayloadAction<TodoListType["id"]>) => {
      const index = state.findIndex((todo) => todo.id === action.payload);
      state.splice(index, 1);
    },
    editTodo: (state, action: PayloadAction<TodoListType>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      state[index] = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addTodo, editTodo, deleteTodo } = todoListSlice.actions;

export default todoListSlice.reducer;
