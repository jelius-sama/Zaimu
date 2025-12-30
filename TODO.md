## Implement parsing email and extracting needed data.

```sh
curl --unix-socket "$HOME/zaimu/unix.sock" \
  -X POST http://unix/ingest/email \
  --data-binary @"$HOME/Downloads/test.eml"
```
