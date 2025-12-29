package handler

import (
    "crypto/rand"
    "encoding/binary"
    "errors"
    "fmt"
    "net"
    "net/http"
    "strings"
    "sync"
    "time"
)

const (
    maxOTPs     = 3
    otpWindow   = 10 * time.Minute
    banDuration = 12 * time.Hour
)

type otpRateState struct {
    count       int
    windowStart time.Time
    bannedUntil time.Time
}

var (
    otpRateMap = make(map[string]*otpRateState)
    rateMu     sync.Mutex
)

func clientIP(r *http.Request) string {
    // Trust X-Forwarded-For if present (first IP)
    if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
        parts := strings.Split(xff, ",")
        return strings.TrimSpace(parts[0])
    }

    host, _, err := net.SplitHostPort(r.RemoteAddr)
    if err != nil {
        return r.RemoteAddr
    }

    return host
}

func allowOTPWithMonitoring(ip string) error {
    now := time.Now()

    rateMu.Lock()
    defer rateMu.Unlock()

    state, ok := otpRateMap[ip]
    if !ok {
        otpRateMap[ip] = &otpRateState{
            count:       1,
            windowStart: now,
        }
        return nil
    }

    // Hard ban check
    if now.Before(state.bannedUntil) {
        return errors.New("ip banned")
    }

    // Window expired → reset counter
    if now.Sub(state.windowStart) > otpWindow {
        state.count = 1
        state.windowStart = now
        return nil
    }

    // Still in window → increment
    state.count++

    if state.count > maxOTPs {
        state.bannedUntil = now.Add(banDuration)
        return errors.New("too many otp requests; ip banned")
    }

    return nil
}

func allowIP(ip string) error {
    rateMu.Lock()
    defer rateMu.Unlock()

    state, ok := otpRateMap[ip]
    if !ok {
        return nil
    }

    if time.Now().Before(state.bannedUntil) {
        return errors.New("ip banned")
    }

    return nil
}

func generateOTP(r *http.Request) (string, error) {
    ip := clientIP(r)

    if err := allowOTPWithMonitoring(ip); err != nil {
        return "", err
    }

    for {
        var n uint32
        if err := binary.Read(rand.Reader, binary.BigEndian, &n); err != nil {
            return "", errors.New("failed to read crypto random")
        }

        // eliminate modulo bias
        if n < 4_294_967_296-(4_294_967_296%1_000_000) {
            return fmt.Sprintf("%06d", n%1_000_000), nil
        }
    }
}

func VerifyOTP(w http.ResponseWriter, r *http.Request) {
    otp := r.FormValue("otp")
    if otp == "" {
        http.Error(w, "missing otp", http.StatusBadRequest)
        return
    }

    stateMu.Lock()
    defer stateMu.Unlock()

    if currentOTP == "" || time.Now().After(otpExpiresAt) {
        http.Error(w, "otp expired", http.StatusUnauthorized)
        return
    }

    if otp != currentOTP {
        http.Error(w, "invalid otp", http.StatusUnauthorized)
        return
    }

    // OTP valid — clear it
    currentOTP = ""
    otpExpiresAt = time.Time{}

    token := generateToken()
    authToken = token
    authTokenExpires = time.Now().Add(30 * time.Minute)

    http.SetCookie(w, &http.Cookie{
        Name:     "auth",
        Value:    token,
        Path:     "/",
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteStrictMode,
        Expires:  authTokenExpires,
    })

    delete(otpRateMap, clientIP(r))

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"authenticated"}`))
}

