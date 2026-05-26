import { configureStore } from "@reduxjs/toolkit";
import doctorsReducer from "./doctorsSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    doctors: doctorsReducer,
  },
});