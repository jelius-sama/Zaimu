package api

import (
    "net/http"
    "zaimu/api/handler"
)

var ApiRoutes = map[string]http.HandlerFunc{
    "GET /version":          handler.GetVersion,
    "GET /transactions":     handler.GetTransactions,
    "GET /category_summery": handler.GetCategorySummary,
    "GET /monthly_data":     handler.GetMonthlyData,
}

