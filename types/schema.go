package types

import (
    "github.com/google/uuid"
    "time"
)

type TransactionType int
type TransactionMethod int

const (
    TTExpense TransactionType = iota
    TTIncome
)

const (
    TMCard TransactionMethod = iota
    TMTransfer
    TMCash
)

var ttName = map[TransactionType]string{
    TTExpense: "expense",
    TTIncome:  "income",
}

var tmName = map[TransactionMethod]string{
    TMCard:     "card",
    TMTransfer: "transfer",
    TMCash:     "cash",
}

func (tt TransactionType) String() string {
    return ttName[tt]
}

func (tm TransactionMethod) String() string {
    return tmName[tm]
}

type Transaction struct {
    ID          uuid.UUID         `json:"id"`
    Date        time.Time         `json:"date"`
    Merchant    string            `json:"merchant"`
    Category    string            `json:"category"`
    Description string            `json:"description"`
    Amount      float64           `json:"amount"`
    Type        TransactionType   `json:"type"`
    Method      TransactionMethod `json:"method"`
    Tags        []string          `json:"tags"`
}

type CategorySummary struct {
    Name       string  `json:"name"`
    Total      float64 `json:"total"`
    Count      int     `json:"count"`
    Percentage float64 `json:"percentage"`
}

type MonthlyData struct {
    ID       string  `json:"id"` // Concatination of month, "-", and year. Ex.: "2025-dec", "2026-jan"
    Year     uint16  `json:"year"`
    Month    string  `json:"month"`
    Income   float64 `json:"income"`
    Expenses float64 `json:"expenses"`
}

// TODO: Tommorow, implement client API (don't forget to fill the DB with mock datas) replacing all the functions in mock-data, then work on backend APIs.

