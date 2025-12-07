package parser

import (
	vars "zaimu"
	"zaimu/types"
	"errors"
	"io/fs"
	"os"
)

const DevHTMLShell string = `<!doctype html>
<html lang="en">

<head>
  <script type="module" src="http://localhost:5173/@vite/client"></script>

  <!-- Server Props -->
  <!-- SSR Data -->
</head>

<body>
  <div id="root"></div>
  <script type="module" src="http://localhost:5173/src/main.tsx"></script>
</body>

</html>`

func GetHTML() ([]byte, error) {
	if os.Getenv("env") == types.ENV.Prod {
		content, err := fs.ReadFile(vars.ViteFS, "client/dist/index.html")
		if err != nil {
			return []byte{}, errors.New("file not found")
		}

		return content, nil
	} else {
		return []byte(DevHTMLShell), nil
	}
}
