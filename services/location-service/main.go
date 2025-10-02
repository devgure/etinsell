package main

import (
    "fmt"
    "github.com/go-redis/redis/v9"
    "context"
    "net/http"
)

var ctx = context.Background()

func main() {
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })
    http.HandleFunc("/nearby", func(w http.ResponseWriter, r *http.Request) {
        // placeholder: use GEOSEARCH on rdb
        fmt.Fprintf(w, "[]")
    })
    http.ListenAndServe(":3070", nil)
    _ = rdb
}
