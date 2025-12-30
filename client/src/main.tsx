/* @refresh reload */
import '@/app.css'
import { Switch, createSignal, type JSX, onMount, lazy, Suspense, ErrorBoundary, createEffect, createRenderEffect, Match } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '@/contexts/config'
import { Router, Route, type RouteSectionProps, useLocation } from "@solidjs/router";
import { QueryClientProvider, QueryClient } from '@tanstack/solid-query'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core"
import { MetaProvider } from "@solidjs/meta"
import { appState } from '@/contexts/app';
import { toast } from 'solid-sonner';

const queryClient = new QueryClient()

const Dashboard = lazy(() => import("@/pages/dashboard"))
const NotFound = lazy(() => import("@/pages/not-found"))
const ClientError = lazy(() => import("@/pages/client-error"))
const Toaster = lazy(() => import('@/components/ui/sonner'))
const Ledger = lazy(() => import("@/pages/ledger"))
const Settings = lazy(() => import("@/pages/settings"))
const Insights = lazy(() => import("@/pages/insights"))
const Auth = lazy(() => import("@/pages/auth"))

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
  const [sidebarContentHeight, setSidebarContentHeight] = createSignal(0);
  let ro: ResizeObserver | undefined;

  const findAndObserve = () => {
    const el = document.querySelector<HTMLElement>('[data-sidebar="header"]');
    if (!el) return false;

    ro = new ResizeObserver(([e]) => {
      setSidebarContentHeight(e.contentRect.height);
    });
    ro.observe(el);
    return true;
  };

  onMount(() => {
    if (findAndObserve()) return;

    const mo = new MutationObserver(() => {
      if (findAndObserve()) mo.disconnect();
    });

    mo.observe(document.body, { childList: true, subtree: true });
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <ErrorBoundary fallback={(err) => (<ClientError error={err} />)}>
        <Suspense>
          <SidebarInset>
            <header class="flex shrink-0 items-center gap-2 border-b border-sidebar-border px-4"
              /* NOTE: We are trying to set the same height as sidebar header */
              /* INFO: First we calculate the actual content height then account for top and bottom padding and then the border width */
              /* INFO: This gives us the formula: `sidebarHeaderHeight()` + `0.5*2 rem` + `1 px`*/
              style={{ height: sidebarContentHeight() > 0 ? `calc(${sidebarContentHeight()}px + ${0.5 * 2}rem + 1px)` : "4.3125rem" }}>
              {
                /* NOTE: If the sidebar is initially closed, `sidebarContentHeight` may be 0.
                 *       We could re-calculate `sidebarContentHeight` after the sidebar is opened
                 *       and capture the correct height, but that would cause a sudden and abrupt
                 *       layout shift, which may be uncomfortable for the user.
                 *
                 * INFO: Another option would be to render the sidebar off-screen (out of view)
                 *       and measure its height there, but this adds complexity and is likely
                 *       not worth the trade-off.
                 */
              }
              <SidebarTrigger class="-ml-1" />
              <div class="flex items-center gap-2">
                <h1
                  class="text-lg font-semibold transition-opacity duration-200 ease-out"
                  classList={{
                    "opacity-0 pointer-events-none":
                      appState.pageTitleVisible !== false,
                    "opacity-100":
                      appState.pageTitleVisible === false,
                  }}
                >
                  {config.activeTitle()}
                </h1>
              </div>

            </header>
            <section class="w-full h-[calc(100vh_-_4rem)] overflow-scroll">
              {props.children}
            </section>
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

  return (
    <Switch fallback={props.comp}>
      <Match when={!isSSRLoaded()}>
        <div class="flex min-h-screen items-center justify-center bg-background">
          <div class="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <div class="flex h-32 w-32 items-center justify-center rounded-xl border border-border overflow-hidden">
              <img src="/assets/zaimu.png" class="w-full h-full" />
            </div>

            <div class="h-8 w-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
          </div>
        </div>
      </Match>

      <Match when={isSSRLoaded() && errorPath() === location.pathname}>
        <h3>500 - Internal server error</h3>
      </Match>
    </Switch>
  )
}

export const Authenticate = (props: { page: JSX.Element }) => {
  const [status, setStatus] = createSignal<"pending" | "success" | "error">("pending")
  const [isBanned, setIsBanned] = createSignal(false)

  const validateStatus = () => {
    fetch(`/api/verify_auth`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          setStatus("success")
        } else if (res.status === 498) {
          toast.warning("Session expired, sign in again!")
          setStatus("error")
        } else if (res.status === 403) {
          setStatus("error")
          setIsBanned(true)
        } else {
          setStatus("error")
        }
      })
      .catch(() => setStatus("error"))
  }

  onMount(() => {
    validateStatus()
  })

  return (
    <Switch>
      <Match when={status() === "success" && !isBanned()}>
        {props.page}
      </Match>

      <Match when={status() === "error" && !isBanned()}>
        <Auth validateStatus={validateStatus} />
      </Match>

      <Match when={status() === "pending" && !isBanned()}>
        <div class="flex min-h-screen items-center justify-center bg-background">
          <div class="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <div class="flex h-32 w-32 items-center justify-center rounded-xl border border-border overflow-hidden">
              <img src="/assets/zaimu.png" class="w-full h-full" />
            </div>

            <div class="h-8 w-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
          </div>
        </div>
      </Match>

      <Match when={isBanned()}>
        <div class="flex min-h-screen items-center justify-center px-4 py-8 bg-background">
          <div class="w-full text-center space-y-6 animate-in fade-in duration-500">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
              <span class="text-destructive text-xl font-medium">!</span>
            </div>

            <h1 class="text-3xl font-light tracking-tight text-foreground">
              Access blocked
            </h1>

            <p class="text-sm text-muted-foreground leading-relaxed">
              Your access has been temporarily restricted due to unusual activity.
              <br />
              Please try again later.
            </p>

            <p class="text-xs text-muted-foreground">
              This restriction is automatic but will not expire on its own.
            </p>
          </div>
        </div>
      </Match>
    </Switch>
  )
}

render(() => {
  const storageManager = createLocalStorageManager("template-theme")

  return (
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <MetaProvider>
          <ColorModeScript storageType={storageManager.type} />
          <ColorModeProvider storageManager={storageManager}>

            <Router root={(props: RouteSectionProps) => <Authenticate page={<App {...props} />} />}>
              <Route path='/' component={() => <ServerErrorWrapper comp={<Dashboard />} />} />
              <Route path='/settings' component={() => <ServerErrorWrapper comp={<Settings />} />} />
              <Route path='/ledger' component={() => <ServerErrorWrapper comp={<Ledger />} />} />
              <Route path='/insights' component={() => <ServerErrorWrapper comp={<Insights />} />} />
              <Route path='*' component={() => <ServerErrorWrapper comp={<NotFound />} />} />
            </Router>
            <Suspense><Toaster richColors={true} /></Suspense>
          </ColorModeProvider>
        </MetaProvider>
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
