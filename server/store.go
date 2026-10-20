package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"sync"
	"time"
)

type Store struct {
	mu         sync.RWMutex
	productIDs []string
	products   map[string]*Product
	orders     []*Order
	customers  map[string]*Customer
	listeners  map[chan []byte]bool
}

func NewStore() *Store {
	s := &Store{
		productIDs: make([]string, 0),
		products:   make(map[string]*Product),
		orders:     make([]*Order, 0),
		customers:  make(map[string]*Customer),
		listeners:  make(map[chan []byte]bool),
	}
	s.seedDefaultProducts()
	return s
}

func (s *Store) seedDefaultProducts() {
	defaultProducts := []*Product{
		{
			ID:           "prod-comfort-edit",
			Title:        "Set Botánico The Comfort Edit",
			Slug:         "the-comfort-edit",
			Price:        45.00,
			CompareAt:    60.00,
			Category:     "Sets Exclusivos",
			Stock:        14,
			InitialStock: 14,
			Image:        "/images/products/spa-collection.webp",
			Description:  "Una invitación a desacelerar, descansar y encontrar la calma. Incluye: Sales de Baño de Lavanda, Capullos Aromáticos y Agua Floral Pura.",
			Featured:     true,
		},
		{
			ID:           "prod-hand-cream",
			Title:        "Crema de Manos Lavanda y Cítricos",
			Slug:         "lavender-citrus-hand-cream",
			Price:        27.00,
			Category:     "Cuidado Corporal",
			Stock:        25,
			InitialStock: 25,
			Image:        "/images/products/hand-cream.webp",
			Description:  "Fórmula botánica de nutrición profunda infusionada con lavanda orgánica pura y esencias cítricas revitalizantes.",
			Featured:     true,
		},
		{
			ID:           "prod-kids-roll-on",
			Title:        "Roll-on Relajante de Lavanda Infantil",
			Slug:         "dreamy-lavender-roll-on",
			Price:        18.00,
			Category:     "Bienestar",
			Stock:        18,
			InitialStock: 18,
			Image:        "/images/products/roll-on.webp",
			Description:  "Suave aceite esencial roll-on de 10ml especialmente formulado para rutinas nocturnas y descanso sereno.",
			Featured:     true,
		},
		{
			ID:           "prod-lip-balm",
			Title:        "Bálsamo Labial de Lavanda Natural",
			Slug:         "lavender-lip-balm",
			Price:        7.00,
			Category:     "Cuidado Corporal",
			Stock:        40,
			InitialStock: 40,
			Image:        "/images/products/lip-balm.webp",
			Description:  "Bálsamo 100% natural a base de cera de abejas con aceites botánicos prensados en frío y suaves notas de lavanda.",
			Featured:     false,
		},
		{
			ID:           "prod-bouquet",
			Title:        "Ramo de Lavanda Seca Artesanal",
			Slug:         "dried-lavender-bouquet",
			Price:        24.00,
			Category:     "Botánica y Hogar",
			Stock:        15,
			InitialStock: 15,
			Image:        "/images/products/bouquet.webp",
			Description:  "Ramillete de lavanda secado naturalmente al sol con fragancia duradera y estética campestre atemporal.",
			Featured:     true,
		},
		{
			ID:           "prod-shortbread",
			Title:        "Galletas de Mantequilla, Lavanda y Limón",
			Slug:         "lavender-shortbread",
			Price:        20.00,
			Category:     "Gourmet y Culinario",
			Stock:        20,
			InitialStock: 20,
			Image:        "/images/products/cookies.webp",
			Description:  "Galletas artesanales de pura mantequilla infusionadas con flores de lavanda orgánica y ralladura de limón fresco.",
			Featured:     false,
		},
		{
			ID:           "prod-bath-soak",
			Title:        "Sales de Baño Minerales con Lavanda",
			Slug:         "lavender-bath-soak",
			Price:        24.00,
			Category:     "Baño y Spa",
			Stock:        16,
			InitialStock: 16,
			Image:        "/images/products/bath-salts.webp",
			Description:  "Sales minerales del Mar Muerto combinadas con aceite esencial de lavanda francesa y pétalos botánicos secos.",
			Featured:     false,
		},
		{
			ID:           "prod-essential-oil",
			Title:        "Aceite Esencial Puro de Lavanda Francesa",
			Slug:         "phenomenal-essential-oil",
			Price:        20.00,
			Category:     "Bienestar",
			Stock:        30,
			InitialStock: 30,
			Image:        "/images/products/essential-oil.webp",
			Description:  "Aceite esencial 100% puro destilado al vapor, obtenido directamente de nuestros cultivares de lavanda de mayor potencia aromática.",
			Featured:     false,
		},
	}

	s.productIDs = make([]string, 0, len(defaultProducts))
	for _, p := range defaultProducts {
		s.products[p.ID] = p
		s.productIDs = append(s.productIDs, p.ID)
	}
}

func (s *Store) GetProducts() []*Product {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]*Product, 0, len(s.productIDs))
	for _, id := range s.productIDs {
		if p, ok := s.products[id]; ok {
			res = append(res, p)
		}
	}
	return res
}

func (s *Store) GetOrders() []*Order {
	s.mu.RLock()
	defer s.mu.RUnlock()
	// Return a copy so caller can't mutate
	res := make([]*Order, len(s.orders))
	copy(res, s.orders)
	return res
}

func (s *Store) GetCustomers() []*Customer {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]*Customer, 0, len(s.customers))
	for _, c := range s.customers {
		res = append(res, c)
	}
	return res
}

func (s *Store) GetOrdersForCustomer(name string) []*Order {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]*Order, 0)
	for _, o := range s.orders {
		if o.CustomerName == name {
			res = append(res, o)
		}
	}
	return res
}

func (s *Store) GetStats() Stats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var rev float64
	var unitsSold int
	for _, o := range s.orders {
		rev += o.Total
		for _, item := range o.Items {
			unitsSold += item.Quantity
		}
	}

	var stockLeft int
	for _, p := range s.products {
		stockLeft += p.Stock
	}

	return Stats{
		TotalRevenue:   rev,
		TotalOrders:    len(s.orders),
		TotalCustomers: len(s.customers),
		TotalUnitsSold: unitsSold,
		TotalStockLeft: stockLeft,
	}
}

func (s *Store) ProcessCheckout(req CheckoutRequest) (*Order, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if req.CustomerName == "" {
		req.CustomerName = "Invitado Demo"
	}

	if len(req.Items) == 0 {
		return nil, fmt.Errorf("el carrito no contiene artículos")
	}

	// Validate stock
	for _, it := range req.Items {
		prod, ok := s.products[it.ProductID]
		if !ok {
			return nil, fmt.Errorf("producto %s no existe", it.ProductID)
		}
		if it.Quantity <= 0 {
			return nil, fmt.Errorf("cantidad inválida para %s", prod.Title)
		}
		if prod.Stock < it.Quantity {
			return nil, fmt.Errorf("stock insuficiente para %s (disponibles: %d)", prod.Title, prod.Stock)
		}
	}

	// Deduct stock and build order items
	orderItems := make([]OrderItem, 0, len(req.Items))
	var total float64
	var totalItems int

	for _, it := range req.Items {
		prod := s.products[it.ProductID]
		prod.Stock -= it.Quantity

		sub := prod.Price * float64(it.Quantity)
		total += sub
		totalItems += it.Quantity

		orderItems = append(orderItems, OrderItem{
			ProductID: prod.ID,
			Title:     prod.Title,
			Price:     prod.Price,
			Quantity:  it.Quantity,
			Subtotal:  sub,
			Image:     prod.Image,
		})
	}

	orderID := fmt.Sprintf("TB-%05d", rand.Intn(90000)+10000)
	last4 := "4242"
	if len(req.CardNumber) >= 4 {
		last4 = req.CardNumber[len(req.CardNumber)-4:]
	}

	order := &Order{
		ID:              orderID,
		CustomerName:    req.CustomerName,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		Items:           orderItems,
		TotalItems:      totalItems,
		Total:           total,
		Status:          "completed",
		CardLast4:       last4,
		CreatedAt:       time.Now(),
	}

	// Prepend to orders so newest is first
	s.orders = append([]*Order{order}, s.orders...)

	// Update Customer aggregate
	cust, exists := s.customers[req.CustomerName]
	if !exists {
		cust = &Customer{
			Name:        req.CustomerName,
			OrdersCount: 0,
			TotalSpent:  0,
		}
		s.customers[req.CustomerName] = cust
	}
	cust.OrdersCount++
	cust.TotalSpent += total
	cust.LastOrderAt = order.CreatedAt

	// Broadcast SSE update
	go s.broadcastUpdate("order_created")

	return order, nil
}

func (s *Store) UpdateStock(productID string, stock int) (*Product, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	prod, ok := s.products[productID]
	if !ok {
		return nil, fmt.Errorf("producto %s no encontrado", productID)
	}

	if stock < 0 {
		stock = 0
	}
	prod.Stock = stock

	go s.broadcastUpdate("stock_updated")
	return prod, nil
}

func (s *Store) ToggleSoldOut(productID string) (*Product, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	prod, ok := s.products[productID]
	if !ok {
		return nil, fmt.Errorf("producto %s no encontrado", productID)
	}

	if prod.Stock > 0 {
		prod.Stock = 0
	} else {
		if prod.InitialStock > 0 {
			prod.Stock = prod.InitialStock
		} else {
			prod.Stock = 15
		}
	}

	go s.broadcastUpdate("stock_updated")
	return prod, nil
}

func (s *Store) ResetDemo() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.orders = make([]*Order, 0)
	s.customers = make(map[string]*Customer)
	s.products = make(map[string]*Product)
	s.seedDefaultProducts()

	go s.broadcastUpdate("demo_reset")
}

// SSE Subscription
func (s *Store) Subscribe() chan []byte {
	s.mu.Lock()
	defer s.mu.Unlock()
	ch := make(chan []byte, 10)
	s.listeners[ch] = true
	return ch
}

func (s *Store) Unsubscribe(ch chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.listeners, ch)
	close(ch)
}

func (s *Store) broadcastUpdate(action string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	payload, _ := json.Marshal(map[string]interface{}{
		"action":    action,
		"timestamp": time.Now().Unix(),
	})

	for ch := range s.listeners {
		select {
		case ch <- payload:
		default:
		}
	}
}
