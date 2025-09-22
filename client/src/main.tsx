import { StrictMode, useState, Fragment } from 'react'
import '@/index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/theme'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from '@/contexts/config'
import { lazy, Suspense, useLayoutEffect, useEffect, type ReactNode } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useConfig } from "@/contexts/config"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ErrorBoundary } from "@/error-boundary"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const queryClient = new QueryClient()

const Home = lazy(() => import("@/pages/home"))
const NotFound = lazy(() => import("@/pages/not-found"))
const Toaster = lazy(() => import('@/components/ui/sonner'))

let rootEl = document.getElementById('root') as HTMLDivElement | null;

if (!rootEl) {
  if (process.env.NODE_ENV === "development") {
    throw new Error("Root element not found!")
  } else {
    const div = document.createElement('div');
    div.id = "root"
    document.body.appendChild(div);
    rootEl = div
  }
}

const App = () => {
  const { pathname } = useLocation();
  const { activeTitle } = useConfig()

  useLayoutEffect(() => {
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return (
    <Fragment>
      <ErrorBoundary>
        <Suspense>
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{activeTitle}</h1>
              </div>
            </header>
            <Outlet />
          </SidebarInset>
        </Suspense>
      </ErrorBoundary>
    </Fragment>
  )
}

const ServerErrorWrapper = ({ comp }: { comp: ReactNode }) => {
  const [errorPath, setErrorPath] = useState<string | null>(null)
  const { pathname } = useLocation()
  const { setSSRData } = useConfig()
  // INFO: The following state is to avoid race condition
  const [isSSRLoaded, setIsSSRLoaded] = useState(false)

  useLayoutEffect(() => {
    const script = document.getElementById('__SERVER_DATA__')
    if (script && script.textContent) {
      try {
        const data = JSON.parse(script.textContent)
        setSSRData(data)

        // Identify if it's error data (you can refine this signature check)
        if ("status" in data && data.status === 500) {
          setErrorPath(pathname)
        }

        script.remove()
      } catch (err) {
        console.error('Failed to parse SSR data:', err)
      }
    }
    setIsSSRLoaded(true)
  }, [])

  // Clear error when navigating to a different path
  useEffect(() => {
    if (errorPath && pathname !== errorPath) {
      setErrorPath(null)
    }
  }, [pathname, errorPath])

  return !isSSRLoaded ? <p>Loading...</p> : errorPath === pathname ? <h3>500 - Internal server error</h3> : comp
}

export const Authenticate = ({ page }: { page: React.ReactNode }) => {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending")

  useEffect(() => {
    fetch(`/api/verify_auth`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          setStatus("success")
        } else if (res.status === 498) {
          // INFO: Expired token
          setStatus("error")
        } else {
          setStatus("error")
        }
      })
      .catch(() => {
        setStatus("error")
      })
  }, [])

  if (status === "pending") return <p>Loading...</p>
  if (status === "error") return <p>Loading...</p>

  return page
}

const reactRoot = createRoot(rootEl);
reactRoot.render(
  <StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="theme">
            <SidebarProvider>
              <AppSidebar />
              <Routes>
                <Route path='/' element={<App />}>
                  <Route path='/' element={<ServerErrorWrapper comp={<Home />} />} />
                  <Route path='*' element={<ServerErrorWrapper comp={<NotFound />} />} />
                </Route>
              </Routes>
            </SidebarProvider>
            <Suspense><Toaster richColors={true} /></Suspense>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);

// Registering service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
