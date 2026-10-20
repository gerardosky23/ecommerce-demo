package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var globalStore *Store

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func handleGetProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	products := globalStore.GetProducts()
	jsonResponse(w, http.StatusOK, products)
}

func handleGetOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	customerQuery := strings.TrimSpace(r.URL.Query().Get("customer"))
	if customerQuery != "" {
		orders := globalStore.GetOrdersForCustomer(customerQuery)
		jsonResponse(w, http.StatusOK, orders)
		return
	}
	orders := globalStore.GetOrders()
	jsonResponse(w, http.StatusOK, orders)
}

func handleGetCustomers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	customers := globalStore.GetCustomers()
	jsonResponse(w, http.StatusOK, customers)
}

func handleGetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	stats := globalStore.GetStats()
	jsonResponse(w, http.StatusOK, stats)
}

func handleCheckout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido: " + err.Error()})
		return
	}

	order, err := globalStore.ProcessCheckout(req)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"order":   order,
		"stats":   globalStore.GetStats(),
	})
}

func handleReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	globalStore.ResetDemo()
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Demo reestablecida al estado inicial",
		"stats":   globalStore.GetStats(),
	})
}

type UpdateStockRequest struct {
	ProductID string `json:"productId"`
	Stock     *int   `json:"stock,omitempty"`
	Action    string `json:"action,omitempty"`
}

func handleUpdateStock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req UpdateStockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
		return
	}

	if req.ProductID == "" {
		http.Error(w, "productId es requerido", http.StatusBadRequest)
		return
	}

	var prod *Product
	var err error

	if req.Action == "toggle" {
		prod, err = globalStore.ToggleSoldOut(req.ProductID)
	} else if req.Stock != nil {
		prod, err = globalStore.UpdateStock(req.ProductID, *req.Stock)
	} else {
		http.Error(w, "Debe especificar 'stock' numérico o 'action': 'toggle'", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"product": prod,
		"stats":   globalStore.GetStats(),
	})
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Username) == "demo" && strings.TrimSpace(req.Password) == "demo" {
		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"token":   "tb-demo-auth-token-valid",
			"user":    "demo",
		})
		return
	}

	jsonResponse(w, http.StatusUnauthorized, map[string]interface{}{
		"success": false,
		"error":   "Credenciales inválidas. Usa demo / demo",
	})
}

func handleSSEEvents(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ch := globalStore.Subscribe()
	defer globalStore.Unsubscribe(ch)

	// Send initial ping
	fmt.Fprintf(w, "data: {\"type\":\"connected\"}\n\n")
	flusher.Flush()

	notify := r.Context().Done()
	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-notify:
			return
		case msg := <-ch:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		case <-ticker.C:
			fmt.Fprintf(w, ": heartbeat\n\n")
			flusher.Flush()
		}
	}
}

func main() {
	globalStore = NewStore()

	mux := http.NewServeMux()

	// API Endpoints
	mux.HandleFunc("/api/products", enableCORS(handleGetProducts))
	mux.HandleFunc("/api/products/stock", enableCORS(handleUpdateStock))
	mux.HandleFunc("/api/login", enableCORS(handleLogin))
	mux.HandleFunc("/api/orders", enableCORS(handleGetOrders))
	mux.HandleFunc("/api/customers", enableCORS(handleGetCustomers))
	mux.HandleFunc("/api/stats", enableCORS(handleGetStats))
	mux.HandleFunc("/api/checkout", enableCORS(handleCheckout))
	mux.HandleFunc("/api/reset", enableCORS(handleReset))
	mux.HandleFunc("/api/events", enableCORS(handleSSEEvents))

	// Static Admin Dashboard
	adminDir := "./admin"
	if _, err := os.Stat(adminDir); os.IsNotExist(err) {
		adminDir = "./server/admin"
	}
	fs := http.FileServer(http.Dir(adminDir))
	mux.Handle("/admin/", http.StripPrefix("/admin", fs))
	mux.HandleFunc("/admin", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/admin/", http.StatusFound)
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/health" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"ok","service":"terre-bleu-api"}`))
			return
		}
		fs.ServeHTTP(w, r)
	})

	port := ":8080"
	fmt.Println("=====================================================")
	fmt.Printf("🚀 Terre Bleu Go Backoffice & API corriendo en: http://localhost%s\n", port)
	fmt.Printf("   Panel Administrativo: http://localhost%s/admin\n", port)
	fmt.Printf("   API Productos:        http://localhost%s/api/products\n", port)
	fmt.Printf("   API Ventas/Órdenes:   http://localhost%s/api/orders\n", port)
	fmt.Println("=====================================================")

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Error al iniciar servidor Go: %v", err)
	}
}
