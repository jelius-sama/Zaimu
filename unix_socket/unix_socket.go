package unixsocket

import (
    "fmt"
    "net"
    "net/http"
    "os"
    "path/filepath"
    "zaimu/logger"
)

func StartUnixSocketServer() error {
    homeDir := os.Getenv("home")
    if homeDir == "" {
        return fmt.Errorf("home env not set")
    }

    inboxDir := filepath.Join(homeDir, "failed_inbox")
    socketPath := filepath.Join(homeDir, "unix.sock")

    if err := os.MkdirAll(inboxDir, 0700); err != nil {
        return err
    }

    if err := os.Remove(socketPath); err != nil && !os.IsNotExist(err) {
        return err
    }

    l, err := net.Listen("unix", socketPath)
    if err != nil {
        return err
    }

    // Restrict access
    if err := os.Chmod(socketPath, 0600); err != nil {
        return err
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/ingest/email", emailHandler(inboxDir))
    mux.HandleFunc("/create/transaction", insertTransaction)

    server := &http.Server{
        Handler: mux,
    }

    go func() {
        if err := server.Serve(l); err != nil {
            logger.Panic("failed to start server on unix socket:", err)
        }
    }()

    return nil
}

