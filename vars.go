package vars

import (
	"Template/types"
	"embed"
)

//go:embed client/dist/**
var ViteFS embed.FS

//go:embed assets/**
var AssetsFS embed.FS

var ReverseProxy types.BehindReverseProxy
