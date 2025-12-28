package handler

import (
    "encoding/json"
    "net/http"
    "time"

    "fmt"
    "zaimu/db"
    "zaimu/types"
)

func GetCategorySummary(w http.ResponseWriter, r *http.Request) {
    var (
        year  int
        month int
    )

    if y := r.URL.Query().Get("year"); y != "" {
        fmt.Sscan(y, &year)
    }
    if m := r.URL.Query().Get("month"); m != "" {
        fmt.Sscan(m, &month)
    }

    // basic validation
    if year == 0 || month < 1 || month > 12 {
        http.Error(w, "invalid year or month", http.StatusBadRequest)
        return
    }

    start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
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

    var data []types.CategorySummary

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

