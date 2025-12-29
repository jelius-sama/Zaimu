package api

import (
    "net/http"
    "zaimu/api/handler"
)

var ApiRoutes = map[string]http.HandlerFunc{
    "GET /version":          handler.GetVersion,
    "GET /transactions":     RequireAuth(handler.GetTransactions),
    "GET /category_summery": RequireAuth(handler.GetCategorySummary),
    "GET /monthly_data":     RequireAuth(handler.GetMonthlyData),
    "POST /sign_in":         handler.Signin,
    "POST /verify_otp":      handler.VerifyOTP,
    "GET /verify_auth":      handler.VerifyAuth,
    "GET /sign_out":         RequireAuth(handler.SignOut),
}

