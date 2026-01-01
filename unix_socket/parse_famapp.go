package unixsocket

import (
    "fmt"
    "regexp"
    "strconv"
    "strings"
    "time"
    "zaimu/types"

    "github.com/DusanKasan/parsemail"
    "github.com/google/uuid"
    "golang.org/x/net/html"
)

// parseFamAppEmail parses FamApp transaction emails
func parseFamAppEmail(rawEml []byte) (*types.Transaction, error) {
    email, err := parsemail.Parse(strings.NewReader(string(rawEml)))
    if err != nil {
        return nil, fmt.Errorf("failed to parse email: %w", err)
    }

    // Extract HTML body
    htmlBody := email.HTMLBody
    if htmlBody == "" {
        return nil, fmt.Errorf("no HTML body found in email")
    }

    return parseFamAppHTML(htmlBody)
}

// parseFamAppHTML parses the HTML content of a FamApp transaction email
func parseFamAppHTML(htmlContent string) (*types.Transaction, error) {
    doc, err := html.Parse(strings.NewReader(htmlContent))
    if err != nil {
        return nil, fmt.Errorf("failed to parse HTML: %w", err)
    }

    // Extract all text content from the HTML
    textContent := extractText(doc)

    // Parse transaction type (paid vs received)
    transactionType, actionText, err := parseTransactionType(textContent)
    if err != nil {
        return nil, err
    }

    // Parse amount
    amount, err := parseAmount(textContent)
    if err != nil {
        return nil, err
    }

    // Parse merchant name
    merchant, err := parseMerchant(textContent, transactionType)
    if err != nil {
        return nil, err
    }

    // Parse date
    date, err := parseDate(textContent)
    if err != nil {
        return nil, err
    }

    // Build description
    description := buildDescription(actionText, amount, merchant, transactionType)

    return &types.Transaction{
        ID:          uuid.New(),
        Date:        date,
        Merchant:    merchant,
        Category:    "Transaction",
        Description: description,
        Amount:      amount,
        Type:        transactionType,
        Method:      types.TMTransfer,
        Tags:        []string{"FamApp", "Transaction"},
    }, nil
}

// extractText recursively extracts all text content from HTML nodes
func extractText(n *html.Node) string {
    var text strings.Builder
    var extract func(*html.Node)
    extract = func(node *html.Node) {
        if node.Type == html.TextNode {
            text.WriteString(node.Data)
            text.WriteString(" ")
        }
        for c := node.FirstChild; c != nil; c = c.NextSibling {
            extract(c)
        }
    }
    extract(n)
    return text.String()
}

// parseTransactionType determines if this is a payment or receipt
func parseTransactionType(text string) (types.TransactionType, string, error) {
    text = strings.ToLower(text)

    if strings.Contains(text, "you have successfully paid") {
        return types.TTExpense, "paid", nil
    }
    if strings.Contains(text, "you have successfully received") {
        return types.TTIncome, "received", nil
    }

    return types.TTExpense, "", fmt.Errorf("unable to determine transaction type")
}

// parseAmount extracts the amount from the email
func parseAmount(text string) (float64, error) {
    // Look for pattern like "₹1.0" or "₹123.45"
    re := regexp.MustCompile(`₹\s*([0-9]+(?:\.[0-9]+)?)`)
    matches := re.FindAllStringSubmatch(text, -1)

    if len(matches) == 0 {
        return 0, fmt.Errorf("no amount found in email")
    }

    // The first match should be the transaction amount (not the updated balance)
    amountStr := matches[0][1]
    amount, err := strconv.ParseFloat(amountStr, 64)
    if err != nil {
        return 0, fmt.Errorf("failed to parse amount: %w", err)
    }

    return amount, nil
}

// parseMerchant extracts the merchant/payee name
func parseMerchant(text string, transactionType types.TransactionType) (string, error) {
    var pattern string
    if transactionType == types.TTExpense {
        // For payments: "to NAME" - matches until "Transaction ID"
        pattern = `to\s+(.+?)\s+Transaction ID`
    } else {
        // For receipts: "from NAME" - matches until "Transaction ID"
        pattern = `from\s+(.+?)\s+Transaction ID`
    }

    re := regexp.MustCompile(pattern)
    matches := re.FindStringSubmatch(text)

    if len(matches) < 2 {
        return "", fmt.Errorf("merchant name not found")
    }

    // Clean up the merchant name
    merchant := strings.TrimSpace(matches[1])
    // Remove extra whitespace and newlines
    merchant = regexp.MustCompile(`\s+`).ReplaceAllString(merchant, " ")

    return merchant, nil
}

// parseDate extracts and parses the transaction date
func parseDate(text string) (time.Time, error) {
    // Look for pattern like "10:25 PM IST, 30 December 2025"
    re := regexp.MustCompile(`(\d{1,2}:\d{2}\s+(?:AM|PM)\s+IST),\s+(\d{1,2}\s+\w+\s+\d{4})`)
    matches := re.FindStringSubmatch(text)

    if len(matches) < 3 {
        return time.Time{}, fmt.Errorf("date not found in email")
    }

    timeStr := matches[1]
    dateStr := matches[2]

    // Combine and parse
    fullDateStr := fmt.Sprintf("%s, %s", timeStr, dateStr)

    // Parse the date
    layout := "3:04 PM MST, 2 January 2006"
    parsedTime, err := time.Parse(layout, fullDateStr)
    if err != nil {
        return time.Time{}, fmt.Errorf("failed to parse date: %w", err)
    }

    return parsedTime, nil
}

// buildDescription creates a description from the extracted data
func buildDescription(actionText string, amount float64, merchant string, transactionType types.TransactionType) string {
    preposition := "to"
    if transactionType == types.TTIncome {
        preposition = "from"
    }

    return fmt.Sprintf("You have successfully %s ₹%.2f %s %s",
        actionText, amount, preposition, merchant)
}

