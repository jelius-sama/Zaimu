import { createContext, useContext, createSignal, type JSX, onCleanup, createRenderEffect, on } from "solid-js";
import AppConfigJSON from "~/client.config.json";
import StaticRouteJSON from "~/static.route.json";
import { type StaticRoute } from "@/types/static.route";
import { useLocation } from "@solidjs/router";

// Types
type SSRData = {
  path: string;
  metadata: StaticRoute;
  api_resp: any;
};

type ConfigState = {
  activeTitle: () => string | null; // signal accessor
  setActiveTitle: (title: string | null) => void;
  app: typeof AppConfigJSON;
  staticRoute: StaticRoute[];
  ssrData: () => SSRData | null; // signal accessor
  setSSRData: (data: SSRData | null) => void;
};

// Create context
const ConfigProviderContext = createContext<ConfigState>();

// Provider component
export function ConfigProvider(props: { children: JSX.Element }) {
  const [ssrData, setSSRData] = createSignal<SSRData | null>(null);
  const [activeTitle, setActiveTitle] = createSignal<string | null>(null);

  return (
    <ConfigProviderContext.Provider
      value={{
        app: AppConfigJSON,
        staticRoute: StaticRouteJSON as StaticRoute[],
        ssrData, // pass the signal itself
        setSSRData,
        activeTitle, // pass the signal itself
        setActiveTitle,
      }}
    >
      {props.children}
    </ConfigProviderContext.Provider>
  );
}

// Hook to consume context
export function useConfig() {
  const context = useContext(ConfigProviderContext);
  if (!context) throw new Error("useConfig must be used within a ConfigProvider");
  return context;
}

// Hook to update activeTitle reactively
export function useActiveTitle(title: string | null) {
  const { setActiveTitle } = useConfig();
  const location = useLocation();

  createRenderEffect(on(
    () => [title, location.pathname],
    () => {
      setActiveTitle(title);
      // Reset on unmount or route change
      onCleanup(() => setActiveTitle(null));
    }));
}
