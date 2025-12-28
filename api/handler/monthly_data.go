package handler

import (
    "encoding/json"
    "net/http"

    "fmt"
    "zaimu/db"
    "zaimu/types"
)

func GetMonthlyData(w http.ResponseWriter, r *http.Request) {
    var year int
    if y := r.URL.Query().Get("year"); y != "" {
        fmt.Sscan(y, &year)
    }

    rows, err := db.Conn.Query(`
        SELECT
            id, year, month, income, expenses
        FROM monthly_data
        WHERE year = ?
        ORDER BY year, month
    `, year)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var data []types.MonthlyData
    for rows.Next() {
        var r types.MonthlyData
        if err := rows.Scan(
            &r.ID, &r.Year, &r.Month,
            &r.Income, &r.Expenses,
        ); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        data = append(data, r)
    }

    resp := map[string]any{
        "data": data,
        "metadata": Metadata{
            Page:        1,
            TotalItems:  len(data),
            HasNextPage: false,
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

