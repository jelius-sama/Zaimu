package handler

import (
    "encoding/json"
    "net/http"

    "fmt"
    "strings"
    "zaimu/db"
    "zaimu/types"
)

func monthToPascal(m string) string {
    if len(m) == 0 {
        return m
    }
    return strings.ToUpper(m[:1]) + strings.ToLower(m[1:])
}

func GetMonthlyData(w http.ResponseWriter, r *http.Request) {
    var year uint16
    if y := r.URL.Query().Get("year"); y != "" {
        fmt.Sscan(y, &year)
    }

    rows, err := db.Conn.Query(`
        SELECT
            id, year, month, income, expenses
        FROM monthly_data
        WHERE year = ?
        ORDER BY
            CASE month
                WHEN 'jan' THEN 1
                WHEN 'feb' THEN 2
                WHEN 'mar' THEN 3
                WHEN 'apr' THEN 4
                WHEN 'may' THEN 5
                WHEN 'jun' THEN 6
                WHEN 'jul' THEN 7
                WHEN 'aug' THEN 8
                WHEN 'sep' THEN 9
                WHEN 'oct' THEN 10
                WHEN 'nov' THEN 11
                WHEN 'dec' THEN 12
            END
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

        // Normalize month for API output
        r.Month = monthToPascal(r.Month)

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

