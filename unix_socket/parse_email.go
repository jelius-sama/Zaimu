package unixsocket

import (
    "bytes"
    "fmt"
    "strings"
    "zaimu/types"

    "github.com/DusanKasan/parsemail"
)

type senderParser func(rawEml []byte) (*types.Transaction, error)

var senderParsers = map[string]senderParser{
    // INFO: The email below might be wrong, requires testing to
    //        see what email they actually use in practice.
    "no-reply@google.com": parseGPayEmail,
    "no-reply@sbi.in":     parseSBIEmail,
}

func parseEmail(rawEml []byte) (*types.Transaction, error) {
    normalizeSender := func(sender string) string {
        return strings.ToLower(strings.TrimSpace(sender))
    }

    email, err := parsemail.Parse(bytes.NewReader(rawEml))
    if err != nil {
        return nil, fmt.Errorf("failed to parse email: %w", err)
    }

    if len(email.From) == 0 {
        return nil, fmt.Errorf("email missing From header")
    }

    for _, addr := range email.From {
        if addr == nil || addr.Address == "" {
            continue
        }

        normalized := normalizeSender(addr.Address)

        if parser, ok := senderParsers[normalized]; ok {
            return parser(rawEml)
        }
    }

    return nil, fmt.Errorf("unsupported email sender(s)")
}

