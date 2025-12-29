package handler

import (
    "errors"
    "net/http"
    "time"
)

var (
    ErrIPBanned     = errors.New("ip banned")
    ErrMissingToken = errors.New("missing auth token")
    ErrTokenExpired = errors.New("token expired")
    ErrInvalidToken = errors.New("invalid token")
)

func InternalVerifyAuth(r *http.Request) error {
    ip := clientIP(r)

    if err := allowIP(ip); err != nil {
        return ErrIPBanned
    }

    cookie, err := r.Cookie("auth")
    if err != nil {
        return ErrMissingToken
    }

    stateMu.Lock()
    defer stateMu.Unlock()

    if authToken == "" || time.Now().After(authTokenExpires) {
        return ErrTokenExpired
    }

    if cookie.Value != authToken {
        return ErrInvalidToken
    }

    return nil
}

func VerifyAuth(w http.ResponseWriter, r *http.Request) {
    err := InternalVerifyAuth(r)

    switch err {
    case nil:
        // refresh validity
        stateMu.Lock()
        authTokenExpires = time.Now().Add(30 * time.Minute)
        exp := authTokenExpires
        token := authToken
        stateMu.Unlock()

        http.SetCookie(w, &http.Cookie{
            Name:     "auth",
            Value:    token,
            Path:     "/",
            HttpOnly: true,
            Secure:   true,
            SameSite: http.SameSiteStrictMode,
            Expires:  exp,
        })

        w.WriteHeader(http.StatusOK)

    case ErrIPBanned:
        http.Error(w, "you are banned", http.StatusForbidden)

    case ErrMissingToken:
        http.Error(w, "missing auth token", http.StatusUnauthorized)

    case ErrTokenExpired, ErrInvalidToken:
        http.Error(w, err.Error(), 498)

    default:
        http.Error(w, "internal error", http.StatusInternalServerError)
    }
}

