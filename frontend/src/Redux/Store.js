import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./UserSlice";
import toastReducer from "./toastSlice";
import themeReducer from "./ThemeSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    toast: toastReducer,
    theme: themeReducer,
  },
});

export default store;
