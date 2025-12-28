package handler

import (
    "encoding/json"
    "net/http"

    "zaimu/db"
    "zaimu/types"
)

func GetMonthlyData(w http.ResponseWriter, r *http.Request) {
    rows, err := db.Conn.Query(`
        SELECT
            id, year, month, income, expenses
        FROM monthly_data
        ORDER BY year, month
    `)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var out []types.MonthlyData

    for rows.Next() {
        var r types.MonthlyData
        if err := rows.Scan(
            &r.ID,
            &r.Year,
            &r.Month,
            &r.Income,
            &r.Expenses,
        ); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        out = append(out, r)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(out)
}

