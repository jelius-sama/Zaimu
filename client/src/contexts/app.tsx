import { createStore } from "solid-js/store";

export interface AppState {
  pageTitleVisible: boolean
}

export const [appState, setAppState] = createStore({
  pageTitleVisible: true,
});
