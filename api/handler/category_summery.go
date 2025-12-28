package handler

import (
    "encoding/json"
    "net/http"
    "time"

    "zaimu/db"
    "zaimu/types"
)

func GetCategorySummary(w http.ResponseWriter, r *http.Request) {
    now := time.Now().UTC()
    start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
    end := start.AddDate(0, 1, 0)

    rows, err := db.Conn.Query(`
        SELECT
            category AS name,
            SUM(amount) AS total,
            COUNT(*) AS count,
            (SUM(amount) / SUM(SUM(amount)) OVER ()) * 100.0 AS percentage
        FROM transactions
        WHERE date >= ?
          AND date <  ?
        GROUP BY category
        ORDER BY total DESC
    `, start.Unix(), end.Unix())

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var out []types.CategorySummary

    for rows.Next() {
        var r types.CategorySummary
        if err := rows.Scan(
            &r.Name,
            &r.Total,
            &r.Count,
            &r.Percentage,
        ); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        out = append(out, r)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(out)
}

