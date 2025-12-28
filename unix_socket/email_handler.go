package unixsocket

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net"
    "net/http"
    "os"
    "path/filepath"
    "time"
    "zaimu/logger"
    "zaimu/types"
)

func saveRawEmail(dir string, data []byte) error {
    name := fmt.Sprintf(
        "%d.eml",
        time.Now().UnixNano(),
    )

    path := filepath.Join(dir, name)
    return os.WriteFile(path, data, 0600)
}

func forwardTransaction(tx *types.Transaction) error {
    home := os.Getenv("home")
    if home == "" {
        return fmt.Errorf("home env not set")
    }

    socketPath := filepath.Join(home, "unix.sock")

    body, err := json.Marshal(tx)
    if err != nil {
        return err
    }

    transport := &http.Transport{
        DialContext: func(_ context.Context, _, _ string) (net.Conn, error) {
            return net.Dial("unix", socketPath)
        },
    }

    client := &http.Client{
        Transport: transport,
    }

    // NOTE: host is ignored; required only to satisfy URL parsing
    req, err := http.NewRequest(
        http.MethodPost,
        "http://unix/create/transaction",
        bytes.NewReader(body),
    )
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")

    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 300 {
        return fmt.Errorf("backend returned %s", resp.Status)
    }

    return nil
}

func emailHandler(inboxDir string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
            return
        }

        raw, err := io.ReadAll(r.Body)
        if err != nil {
            logger.TimedError("Failed to read raw email data:", err)
            http.Error(w, "failed to read body", http.StatusBadRequest)
            return
        }

        tx, err := parseEmail(raw)
        if err != nil {
            logger.TimedError("Failed to parse email:", err)

            if err := saveRawEmail(inboxDir, raw); err != nil {
                logger.TimedError("Failed to save email:", err)
                http.Error(w, "failed to persist raw email", http.StatusInternalServerError)
                return
            }

            w.WriteHeader(http.StatusInternalServerError)
            logger.TimedOkay("email saved for later inspection.")
            w.Write([]byte("email accepted for later processing"))
            return
        }

        if err := forwardTransaction(tx); err != nil {
            logger.TimedError("Failed to save transaction data to database:", err)

            if err := saveRawEmail(inboxDir, raw); err != nil {
                logger.TimedError("Failed to save email:", err)
                http.Error(w, "failed to persist raw email", http.StatusBadGateway)
                return
            }

            http.Error(w, "failed to forward transaction", http.StatusBadGateway)
            return
        }

        w.WriteHeader(http.StatusCreated)
    }
}

