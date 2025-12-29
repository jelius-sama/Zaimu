package handler

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "net/http"
    "os"
    "strings"
    "sync"
    "time"

    mailer "github.com/jelius-sama/libmailer/api"
    "golang.org/x/crypto/bcrypt"
)

var (
    currentOTP   string
    otpExpiresAt time.Time

    authToken        string
    authTokenExpires time.Time

    stateMu sync.Mutex
)

func generateToken() string {
    b := make([]byte, 32)
    rand.Read(b)

    defer func() {
        for i := range b {
            b[i] = 0
        }
    }()

    return hex.EncodeToString(b)
}

func Signin(w http.ResponseWriter, r *http.Request) {
    email := r.FormValue("email")
    password := r.FormValue("password")

    expectedEmail := os.Getenv("ADMIN_EMAIL")
    passwordHash := os.Getenv("ADMIN_PASSWORD_HASH")

    if email == "" || password == "" {
        http.Error(w, "missing credentials", http.StatusBadRequest)
        return
    }

    if email != expectedEmail {
        http.Error(w, "invalid credentials", http.StatusUnauthorized)
        return
    }

    if err := bcrypt.CompareHashAndPassword(
        []byte(passwordHash),
        []byte(password),
    ); err != nil {
        http.Error(w, "invalid credentials", http.StatusUnauthorized)
        return
    }

    otp, err := generateOTP(r)
    if err != nil {
        if strings.Contains(err.Error(), "ip banned") {
            http.Error(w, "you are banned", http.StatusForbidden)
            return
        }

        http.Error(w, "failed to generate an OTP", http.StatusInternalServerError)
        return
    }

    stateMu.Lock()
    currentOTP = otp
    otpExpiresAt = time.Now().Add(5 * time.Minute)
    stateMu.Unlock()

    subject := "Zaimu sign-in code"

    body := fmt.Sprintf(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="color-scheme" content="dark light"> <meta name="supported-color-schemes" content="dark light"> <title>Zaimu sign-in code</title> </head> <body style=" margin:0; padding:0; background-color:rgb(9,9,11); font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; "> <div style=" max-width:480px; margin:0 auto; padding:40px 24px; color:rgb(250,250,250); "> <!-- Logo --> <div style=" margin-bottom:24px; width:64px; height:64px; border-radius:14px; display:flex; align-items:center; justify-content:center; border:1px solid rgb(32,32,36); background-color:rgb(15,15,18); overflow:hidden; "> <img src="https://zaimu.jelius.dev/assets/zaimu.png" alt="Zaimu" width="64" height="64" style=" display:block; width:100%%; height:100%%; object-fit:contain; " /> </div> <!-- Title --> <h1 style=" margin:0 0 16px 0; font-size:26px; font-weight:300; letter-spacing:-0.02em; "> Zaimu verification code </h1> <!-- Message --> <p style=" margin:0 0 24px 0; font-size:14px; line-height:1.6; color:rgb(146,146,154); "> Use the code below to complete your sign-in. This code is valid for the next <strong>5 minutes</strong>. </p> <!-- OTP box --> <div style=" margin-bottom:24px; padding:16px 0; text-align:center; border-radius:8px; background-color:rgb(15,15,18); border:1px solid rgb(32,32,36); "> <span style=" display:inline-block; font-size:28px; letter-spacing:0.3em; font-weight:500; color:rgb(250,250,250); ">%s</span> </div> <!-- Footer --> <p style=" margin:0; font-size:12px; line-height:1.5; color:rgb(61,61,66); "> If you did not request this code, you can safely ignore this email. </p> </div> </body> </html>`, otp)

    cnf, err := mailer.LoadConfig()
    if err != nil {
        http.Error(w, "email server not setup", http.StatusInternalServerError)
        return
    }

    if err := mailer.SendMail(cnf.Host, cnf.Port, cnf.Username, cnf.Password, cnf.From, expectedEmail, subject, body, nil, nil, nil); err != nil {
        http.Error(w, "failed to send otp", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"otp_sent"}`))
}

