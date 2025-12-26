import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE, useSidebar } from "@/components/ui/sidebar";
import { createRenderEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

export interface AppState {
  pageTitleVisible: boolean;
  screen: {
    width: number;
    height: number;
  };
}

export const [appState, setAppState] = createStore<AppState>({
  pageTitleVisible: true,
  screen: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
});

const remToPx = (rem: string) =>
  parseFloat(rem) *
  parseFloat(getComputedStyle(document.documentElement).fontSize);

export function setUsableScreenSize() {
  const sidebar = useSidebar();

  const update = () => {
    const sidebarWidth =
      sidebar.isMobile()
        ? (sidebar.openMobile() ? remToPx(SIDEBAR_WIDTH_MOBILE) : 0)
        : (sidebar.open() ? remToPx(SIDEBAR_WIDTH) : 0);

    setAppState("screen", "width",
      Math.max(0, window.innerWidth - sidebarWidth)
    );

    setAppState("screen", "height", window.innerHeight);
  };

  createRenderEffect(update);

  window.addEventListener("resize", update);
  onCleanup(() => window.removeEventListener("resize", update));
}
