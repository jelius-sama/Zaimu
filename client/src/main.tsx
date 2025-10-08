/* @refresh reload */
import '@/app.css'
import { createSignal, type JSX, children, onMount, lazy, Suspense, ErrorBoundary, createEffect, createRenderEffect } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '@/contexts/config'
import { Router, Route, type RouteSectionProps, useLocation } from "@solidjs/router";
import { QueryClientProvider, QueryClient } from '@tanstack/solid-query'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core"

const queryClient = new QueryClient()

const Home = lazy(() => import("@/pages/home"))
const NotFound = lazy(() => import("@/pages/not-found"))
const ClientError = lazy(() => import("@/pages/client-error"))
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

const App = (props: RouteSectionProps) => {
  const config = useConfig()

  return (
    <SidebarProvider>
      <AppSidebar />
      <ErrorBoundary fallback={(err) => (<ClientError error={err} />)}>
        <Suspense>
          <SidebarInset>
            <header class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
              <SidebarTrigger class="-ml-1" />
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-semibold">{config.activeTitle()}</h1>
              </div>
            </header>
            {props.children}
          </SidebarInset>
        </Suspense>
      </ErrorBoundary>
    </SidebarProvider>
  )
}

const ServerErrorWrapper = (props: { comp: JSX.Element }) => {
  const [errorPath, setErrorPath] = createSignal<string | null>(null)
  const location = useLocation()
  const config = useConfig()
  // INFO: The following state is to avoid race condition
  const [isSSRLoaded, setIsSSRLoaded] = createSignal(false)

  createRenderEffect(() => {
    const script = document.getElementById('__SERVER_DATA__')
    if (script && script.textContent) {
      try {
        const data = JSON.parse(script.textContent)
        config.setSSRData(data)

        // Identify if it's error data (you can refine this signature check)
        if ("status" in data && data.status === 500) {
          setErrorPath(location.pathname)
        }

        script.remove()
      } catch (err) {
        console.error('Failed to parse SSR data:', err)
      }
    }

    setIsSSRLoaded(true)
  })


  // Clear error when navigating to a different path
  createEffect(() => {
    if (errorPath() && location.pathname !== errorPath()) {
      setErrorPath(null)
    }
  })

  return !isSSRLoaded() ? <p>Loading...</p> : errorPath() === location.pathname ? <h3>500 - Internal server error</h3> : props.comp
}

export const Authenticate = ({ page }: { page: JSX.Element }) => {
  const resolved = children(() => page)
  const [status, setStatus] = createSignal<"pending" | "success" | "error">("pending")

  onMount(() => {
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
      .catch(() => setStatus("error"))
  })

  if (status() === "pending") return <p>Loading...</p>
  if (status() === "error") return <p>Loading...</p>

  return resolved()
}

render(() => {
  const storageManager = createLocalStorageManager("template-theme")

  return (
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider storageManager={storageManager}>

          <Router root={(props: RouteSectionProps) => <App {...props} />}>
            <Route path='/' component={() => <ServerErrorWrapper comp={<Home />} />} />
            <Route path='*' component={() => <ServerErrorWrapper comp={<NotFound />} />} />
          </Router>
          <Suspense><Toaster richColors={true} /></Suspense>
        </ColorModeProvider>
      </QueryClientProvider>
    </ConfigProvider>
  )
}, rootEl)

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
