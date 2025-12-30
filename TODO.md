## Implement an API in my `mailparser` project that detects incomming email from bank/pay app and send the raw email to `Zaimu` Project using unix sockets for further processing.
  - `mailparser` project -> `https://github.com/jelius-sama/AWSMailParser.git`
  - `Zaimu` project -> `https://github.com/jelius-sama/Zaimu.git`

```sh
curl --unix-socket "$HOME/zaimu/unix.sock" \
  -X POST http://unix/ingest/email \
  --data-binary @"$HOME/Downloads/test.eml"
```

```go
func isKnownSender(sender string) bool {
    var knownTransactionSenders = []string{
	    "no-reply@google.com",
	    "alerts@hdfcbank.net",
	    "alerts@icicibank.com",
	    "noreply@axisbank.com",
	    "alerts@chase.com",
	    "alerts@bankofamerica.com",
    }

	for _, s := range knownTransactionSenders {
		if strings.EqualFold(sender, s) {
			return true
		}
	}
	return false
}

func forwardRawEmailIfKnownSender(
	rawEML []byte,
	sender string,
) error {
	if !isKnownSender(sender) {
		return nil
	}

	socketPath := filepath.Join("/home/kazuma", "zaimu", "unix.sock")

	transport := &http.Transport{
		DialContext: func(_ context.Context, _, _ string) (net.Conn, error) {
			return net.Dial("unix", socketPath)
		},
	}

	client := &http.Client{
		Transport: transport,
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"http://unix/ingest/email",
		bytes.NewReader(rawEML),
	)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("ingest API returned %s", resp.Status)
	}

	return nil
}
```
