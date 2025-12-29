package api

import (
    "fmt"
    "net/http"
    "strings"
    "zaimu/api/handler"
    "zaimu/logger"
)

func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        logger.TimedInfo(r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}

func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                logger.TimedError("Encountered a panic, returning 500 to client and recovering the server!")
                if strings.HasPrefix(r.URL.Path, "/api/") {
                    InternalErrorAPI(w, r, nil)
                    return
                }

                if strings.HasPrefix(r.URL.Path, "/assets/") {
                    InternalErrorAPI(w, r, nil)
                    return
                }

                if strings.HasPrefix(r.URL.Path, "/src/") {
                    InternalErrorAPI(w, r, nil)
                    return
                }

                InternalErrorPage(w, r, nil)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

func NoCache(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Cache-Control", "no-store")
        w.Header().Set("Pragma", "no-cache") // for HTTP/1.0 proxies
        w.Header().Set("Expires", "0")       // for older caches
        next(w, r)
    }
}

func Cacheable(maxAge int, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
        next(w, r)
    }
}

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
    const bannedHTML = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Access blocked</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <link id="__SERVER_PROPS__" rel="icon" href="/assets/zaimu.png"> <link id="__SERVER_PROPS__" rel="manifest" href="/assets/manifest.json"> <link id="__SERVER_PROPS__" rel="apple-touch-icon" href="/assets/icons/apple-icon-180.png"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2732-2048.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2388-1668.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2048-1536.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1488-2266.png" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2266-1488.png" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1640-2360.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2360-1640.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1668-2224.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2224-1668.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1620-2160.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2160-1620.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1290-2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2796-1290.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1179-2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2556-1179.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1284-2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2778-1284.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1170-2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2532-1170.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2436-1125.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2688-1242.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-828-1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1792-828.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1242-2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-2208-1242.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1334-750.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"> <link id="__SERVER_PROPS__" rel="apple-touch-startup-image" href="/assets/icons/apple-splash-1136-640.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"></head> <body style=" margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background-color:rgb(9,9,11); font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; "> <div style=" width:100%; max-width:420px; text-align:center; padding:32px 16px; color:rgb(250,250,250); "> <div style=" margin:0 auto 24px auto; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid rgba(204,38,38,0.4); background-color:rgba(204,38,38,0.1); "> <span style=" color:rgb(204,38,38); font-size:20px; font-weight:500; ">!</span> </div> <h1 style=" margin:0 0 16px 0; font-size:30px; font-weight:300; letter-spacing:-0.02em; "> Access blocked </h1> <p style=" margin:0 0 12px 0; font-size:14px; line-height:1.6; color:rgb(146,146,154); "> Your access has been temporarily restricted due to unusual activity.<br> Please try again later. </p> <p style=" margin:0; font-size:12px; color:rgb(146,146,154); "> This restriction is automatic but will not expire on its own. </p> </div> </body> </html>`

    isBrowser := func(r *http.Request) bool {
        ua := r.Header.Get("User-Agent")
        return strings.Contains(ua, "Mozilla")
    }

    denyBanned := func(w http.ResponseWriter, r *http.Request) {
        if isBrowser(r) {
            w.Header().Set("Content-Type", "text/html; charset=utf-8")
            w.WriteHeader(http.StatusForbidden)
            w.Write([]byte(bannedHTML))
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusForbidden)
        w.Write([]byte(`{"error":"access blocked","reason":"ip banned"}`))
    }

    return func(w http.ResponseWriter, r *http.Request) {
        if err := handler.InternalVerifyAuth(r); err != nil {
            denyBanned(w, r)
            return
        }
        next(w, r)
    }
}

