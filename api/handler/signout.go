package handler

import (
    "net/http"
    "time"
)

func SignOut(w http.ResponseWriter, r *http.Request) {
    stateMu.Lock()
    authToken = ""
    authTokenExpires = time.Time{}
    stateMu.Unlock()

    // Expire cookie on client
    http.SetCookie(w, &http.Cookie{
        Name:     "auth",
        Value:    "",
        Path:     "/",
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteStrictMode,
        Expires:  time.Unix(0, 0),
        MaxAge:   -1,
    })

    w.WriteHeader(http.StatusOK)
}

