package handler

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "time"

    "fmt"
    "github.com/google/uuid"
    "zaimu/db"
    "zaimu/types"
)

func GetTransactions(w http.ResponseWriter, r *http.Request) {
    page := 1
    if p := r.URL.Query().Get("page"); p != "" {
        fmt.Sscan(p, &page)
    }
    pageSize := 20
    offset := (page - 1) * pageSize

    var total int
    if err := db.Conn.QueryRow(`
        SELECT COUNT(*) FROM transactions
    `).Scan(&total); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    rows, err := db.Conn.Query(`
        SELECT
            t.id,
            t.date,
            t.merchant,
            t.category,
            t.description,
            t.amount,
            t.type,
            t.method,
            tt.tag
        FROM transactions t
        LEFT JOIN transaction_tags tt
            ON tt.transaction_id = t.id
        ORDER BY t.date DESC
        LIMIT ? OFFSET ?
    `, pageSize, offset)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    type agg struct {
        tx   types.Transaction
        tags []string
    }
    m := map[string]*agg{}

    for rows.Next() {
        var (
            idStr string
            date  int64
            tag   sql.NullString
            tx    types.Transaction
        )

        if err := rows.Scan(
            &idStr, &date,
            &tx.Merchant, &tx.Category,
            &tx.Description, &tx.Amount,
            &tx.Type, &tx.Method,
            &tag,
        ); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        id, _ := uuid.Parse(idStr)
        tx.ID = id
        tx.Date = time.Unix(date, 0)

        entry, ok := m[idStr]
        if !ok {
            entry = &agg{tx: tx}
            m[idStr] = entry
        }
        if tag.Valid {
            entry.tags = append(entry.tags, tag.String)
        }
    }

    var data []types.Transaction
    for _, v := range m {
        v.tx.Tags = v.tags
        data = append(data, v.tx)
    }

    resp := map[string]any{
        "data": data,
        "metadata": Metadata{
            Page:        page,
            TotalItems:  total,
            HasNextPage: (page * 10) < total,
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

