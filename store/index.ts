import { combineReducers, configureStore } from "@reduxjs/toolkit";
import todoReducer from "./todoReducer";
import { persistReducer } from "redux-persist";
import { createExpoFileSystemStorage } from "redux-persist-expo-file-system-storage";

export const expoFileSystemStorage = createExpoFileSystemStorage();

const persistConfig = {
  key: "root",
  storage: expoFileSystemStorage,
};

const rootReducer = combineReducers({
  todoReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
