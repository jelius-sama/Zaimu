package api

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/fs"
    "mime"
    "net/http"
    "os"
    "path/filepath"
    "runtime"
    "strings"
    vars "zaimu"
    "zaimu/api/handler"
    "zaimu/logger"
    "zaimu/parser"
    "zaimu/types"
    "zaimu/util"
)

var getOnlyRoute = util.AddrOf("Only Request with GET Method are allowed!")

func HandleRouting() *http.ServeMux {
    router := http.NewServeMux()

    router.HandleFunc("/sitemap.xml", handler.GenerateSitemap)
    router.HandleFunc("/robots.txt", handler.GenerateRobots)

    router.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            MethodNotAllowed(w, r, getOnlyRoute)
            return
        }

        path := strings.TrimPrefix(r.URL.Path, "/")
        content, err := fs.ReadFile(vars.AssetsFS, path)
        if err != nil {
            NotFoundAPI(w, r, util.AddrOf("Requested Asset was not found"))
            return
        }

        ext := filepath.Ext(path)
        mimeType := mime.TypeByExtension(ext)

        switch path {
        case "assets/sw.js":
            mimeType = "application/javascript"
            break

        case "assets/manifest.json":
            mimeType = "application/manifest+json"
            w.Header().Set("Service-Worker-Allowed", "/")
            break

        default:
            if len(mimeType) == 0 {
                mimeType = "application/octet-stream"
            }
            break
        }

        w.Header().Set("Content-Type", mimeType)
        w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
        w.Write(content)
    })

    router.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
        if !strings.HasPrefix(r.URL.Path, "/api/") {
            _, file, line, ok := runtime.Caller(1)
            NotFoundAPI(w, r, util.AddrOf("Unreachable code reached!"))
            if ok {
                logger.Error("Reached unreachable code in `", file, "` at line: ", line)
            } else {
                logger.Error("Reached unreachable code (unknown location)")
            }
            return
        }

        method := r.Method
        path := strings.TrimPrefix(r.URL.Path, "/api/")
        lookupKey := method + " /" + path

        if handler, exists := ApiRoutes[lookupKey]; exists {
            NoCache(handler)(w, r)
            return
        }

        NotFoundAPI(w, r, util.AddrOf("API Route Not Found!"))
    })

    router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            MethodNotAllowed(w, r, getOnlyRoute)
            return
        }

        html, err := parser.GetHTML()
        if err != nil {
            InternalErrorPage(w, r, util.AddrOf("Something went wrong when getting html from FS!"))
            logger.Error("failed to get html shell:\n    " + err.Error())
            return
        }

        ssrData, err, status := parser.PerformSSR(r.URL.Path)
        if err != nil {
            if status == http.StatusNotFound {
                NotFoundPage(w, r, util.AddrOf("Content of dynamic page could not be found!"))
                return
            }

            // TODO: Implement dedicated error pages intead of generic 500 error.
            InternalErrorPage(w, r, util.AddrOf("Failed to perform SSR!"))
            logger.Error("performing SSR failed:\n    " + err.Error())
            return
        }

        if len(ssrData) == 0 {
            var metadata string

            defaultCase := func() error {
                if err := handler.InternalVerifyAuth(r); err != nil {
                    var isBanned bool = false
                    if err == handler.ErrIPBanned {
                        isBanned = true
                    }
                    type DynamicMetadata struct {
                        Title       string
                        Description string
                    }
                    var dynamicMetadata DynamicMetadata

                    if isBanned {
                        dynamicMetadata = DynamicMetadata{
                            Title:       "Access denied",
                            Description: "Access is restricted due to policy or security conditions.",
                        }
                    } else {
                        dynamicMetadata = DynamicMetadata{
                            Title:       "Sign in",
                            Description: "Authentication gateway for validating credentials and establishing a session.",
                        }
                    }

                    rawMetadata := types.RouteMetadata{
                        Path:  r.URL.Path,
                        Title: fmt.Sprintf("%s | Zaimu", dynamicMetadata.Title),
                        Meta: []types.MetaTag{
                            {
                                Name:    "description",
                                Content: dynamicMetadata.Description,
                            },
                            {
                                Name:    "application-name",
                                Content: "Zaimu",
                            },
                            {
                                Name:    "robots",
                                Content: "noindex, nofollow",
                            },
                            {
                                Name:    "format-detection",
                                Content: "telephone=no",
                            },
                            {
                                Name:    "apple-mobile-web-app-capable",
                                Content: "yes",
                            },
                            {
                                Name:    "apple-mobile-web-app-title",
                                Content: "Zaimu",
                            },
                            {
                                Name:    "theme-color",
                                Content: "#09090B",
                            },
                            {
                                Name:    "apple-mobile-web-app-status-bar-style",
                                Content: "default",
                            },
                            {
                                Property: "og:title",
                                Content:  fmt.Sprintf("%s | Zaimu", dynamicMetadata.Title),
                            },
                            {
                                Property: "og:description",
                                Content:  dynamicMetadata.Description,
                            },
                            {
                                Property: "og:url",
                                Content:  "https://zaimu.jelius.dev" + r.URL.Path,
                            },
                            {
                                Property: "og:site_name",
                                Content:  "Zaimu",
                            },
                            {
                                Property: "og:image",
                                Content:  "/assets/zaimu.png",
                            },
                            {
                                Property: "og:type",
                                Content:  "website",
                            },
                            {
                                Name:    "twitter:card",
                                Content: "summary",
                            },
                            {
                                Name:    "twitter:site",
                                Content: "@jelius_sama",
                            },
                            {
                                Name:    "twitter:creator",
                                Content: "@jelius_sama",
                            },
                            {
                                Name:    "twitter:title",
                                Content: fmt.Sprintf("%s | Zaimu", dynamicMetadata.Title),
                            },
                            {
                                Name:    "twitter:description",
                                Content: dynamicMetadata.Description,
                            },
                            {
                                Name:    "twitter:image",
                                Content: "/assets/zaimu.png",
                            },
                        },
                        Link: []types.LinkTag{
                            {
                                Rel:  "canonical",
                                Href: "https://jelius.dev" + r.URL.Path,
                            },
                        },
                    }

                    jsonMetadata, err := json.Marshal([]types.RouteMetadata{rawMetadata})
                    if err != nil {
                        // INFO: We fall back to using static metadata in case something went wrong generating dynamic ones
                        metadata, err = parser.ParseMetadata(r.URL.Path, nil)
                    }
                    metadata, err = parser.ParseMetadata(r.URL.Path, &jsonMetadata)
                } else {
                    metadata, err = parser.ParseMetadata(r.URL.Path, nil)
                }
                if err != nil {
                    return fmt.Errorf("metadata parsing failed: %w", err)
                }
                return nil
            }

            switch r.URL.Path {
            default:
                if err := defaultCase(); err != nil {
                    InternalErrorPage(w, r, util.AddrOf("Failed to parse metadata of the page!"))
                    logger.Error(err.Error())
                    return
                }
            }

            // Replace marker in HTML
            html = bytes.Replace(html, []byte("<!-- Server Props -->"), []byte(metadata), 1)
        } else {
            html = bytes.Replace(html, []byte("<!-- SSR Data -->"), []byte(ssrData), 1)
        }

        w.Header().Set("Content-Type", "text/html; charset=utf-8")
        if len(ssrData) == 0 {
            w.Header().Set("Cache-Control", "public, max-age=86400")
        } else {
            w.Header().Set("Cache-Control", "public, max-age=3600")
        }
        if os.Getenv("env") == types.ENV.Prod {
            w.Header().Set("X-Content-Type-Options", "nosniff")
            w.Header().Set("X-Frame-Options", "DENY")
            w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
            w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
            w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'")
            w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
        }
        w.WriteHeader(http.StatusOK)
        w.Write(html)
    })

    if os.Getenv("env") == types.ENV.Prod {
        router.HandleFunc("/src/", func(w http.ResponseWriter, r *http.Request) {
            if r.Method != http.MethodGet {
                MethodNotAllowed(w, r, getOnlyRoute)
                return
            }

            path := strings.TrimPrefix(r.URL.Path, "/")
            content, err := fs.ReadFile(vars.ViteFS, "client/dist/"+path)
            if err != nil {
                NotFoundAPI(w, r, util.AddrOf("Requested Source file was not found!"))
                return
            }

            ext := filepath.Ext(path)
            mimeType := mime.TypeByExtension(ext)
            if len(mimeType) == 0 {
                mimeType = "application/octet-stream"
            }

            w.Header().Set("Content-Type", mimeType)
            w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
            w.Write(content)
        })
    }

    return router
}

