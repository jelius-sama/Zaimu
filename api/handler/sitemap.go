package handler

import (
	"encoding/xml"
	"net/http"
	"os"
	"time"
)

type urlEntry struct {
	Loc        string `xml:"loc"`
	LastMod    string `xml:"lastmod,omitempty"`
	ChangeFreq string `xml:"changefreq,omitempty"`
	Priority   string `xml:"priority,omitempty"`
}

type urlSet struct {
	XMLName xml.Name   `xml:"urlset"`
	Xmlns   string     `xml:"xmlns,attr"`
	URLs    []urlEntry `xml:"url"`
}

func GenerateSitemap(w http.ResponseWriter, r *http.Request) {
	baseURL := os.Getenv("host")
	now := time.Now().Format("2006-01-02")

	// Static routes
	urls := []urlEntry{
		{Loc: baseURL + "/", LastMod: now, ChangeFreq: "daily", Priority: "1.0"},
	}

	w.Header().Set("Content-Type", "application/xml")

	_ = xml.NewEncoder(w).Encode(urlSet{
		Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  urls,
	})
}
