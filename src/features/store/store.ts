import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { gameReducer } from "@/features/game/gameSlice";
import { themeReducer } from "@/features/theme/themeSlice";
import { settingsReducer } from "@/features/settings/settingsSlice";
import { localScoresApi } from "@/features/scores/localScoresApi";

const rootReducer = combineReducers({
  game: gameReducer,
  theme: themeReducer,
  settings: settingsReducer,
  [localScoresApi.reducerPath]: localScoresApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(localScoresApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
