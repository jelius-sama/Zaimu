import { createContext, useContext, useState, type Dispatch, type SetStateAction, useLayoutEffect } from "react"
import AppConfigJSON from "~/client.config.json";
import StaticRouteJSON from "~/static.route.json";
import { type StaticRoute } from "@/types/static.route";
import { useLocation } from "react-router-dom"

type SSRData = {
  path: string;
  metadata: StaticRoute;
  api_resp: any;
}

type ConfigState = {
  activeTitle: string | null;
  setActiveTitle: Dispatch<SetStateAction<string | null>>
  app: typeof AppConfigJSON;
  staticRoute: StaticRoute[];
  ssrData: SSRData | null;
  setSSRData: Dispatch<SetStateAction<SSRData | null>>;
}

const ConfigProviderContext = createContext<ConfigState | undefined>(undefined)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [ssrData, setSSRData] = useState<SSRData | null>(null)
  const [activeTitle, setInternalActiveTitle] = useState<string | null>(null)

  return (
    <ConfigProviderContext.Provider value={{ app: AppConfigJSON, staticRoute: StaticRouteJSON as StaticRoute[], ssrData: ssrData, setSSRData: setSSRData, setActiveTitle: setInternalActiveTitle, activeTitle: activeTitle }}>
      {children}
    </ConfigProviderContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigProviderContext)

  if (context === undefined)
    throw new Error("useConfig must be used within a ConfigProvider")

  return context
}

export function useActiveTitle(title: string | null) {
  const { setActiveTitle } = useConfig()
  const location = useLocation()

  useLayoutEffect(() => {
    setActiveTitle(title)

    // cleanup: reset on unmount or route change
    return () => setActiveTitle(null)
  }, [title, location.pathname, setActiveTitle])
}
