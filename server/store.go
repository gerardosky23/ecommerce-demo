package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"sync"
	"time"
)

type Store struct {
	mu        sync.RWMutex
	products  map[string]*Product
	orders    []*Order
	customers map[string]*Customer
	listeners map[chan []byte]bool
}

func NewStore() *Store {
	s := &Store{
		products:  make(map[string]*Product),
		orders:    make([]*Order, 0),
		customers: make(map[string]*Customer),
		listeners: make(map[chan []byte]bool),
	}
	s.seedDefaultProducts()
	return s
}

func (s *Store) seedDefaultProducts() {
	defaultProducts := []*Product{
		{
			ID:           "prod-comfort-edit",
			Title:        "The Comfort Edit",
			Slug:         "the-comfort-edit",
			Price:        45.00,
			CompareAt:    60.00,
			Category:     "Signature Sets",
			Stock:        14,
			InitialStock: 14,
			Image:        "https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080",
			Description:  "A little invitation to slow down, unwind, and find your calm. Includes: Lavender Bath Soak, Aromatic Bud, Floral Water.",
			Featured:     true,
		},
		{
			ID:           "prod-hand-cream",
			Title:        "Lavender Citrus Hand Cream",
			Slug:         "lavender-citrus-hand-cream",
			Price:        27.00,
			Category:     "Body & Care",
			Stock:        25,
			InitialStock: 25,
			Image:        "https://www.terrebleu.ca/cdn/shop/files/Lavender_Citrus_Hand_Cream_White_Background_Nov_2024.jpg?v=1767139266&width=1080",
			Description:  "Deeply moisturizing botanical formula infused with pure organic lavender and bright citrus essences.",
			Featured:     true,
		},
		{
			ID:           "prod-kids-roll-on",
			Title:        "Kids Dreamy Lavender Roll On",
			Slug:         "dreamy-lavender-roll-on",
			Price:        18.00,
			Category:     "Wellness",
			Stock:        18,
			InitialStock: 18,
			Image:        "https://www.terrebleu.ca/cdn/shop/files/Dreamy_Lavender_Roll_on_10ml_upright_white_background.png?v=1774540781&width=1080",
			Description:  "Gentle 10ml essential roll-on crafted specifically for evening routines and tranquil bedtimes.",
			Featured:     true,
		},
		{
			ID:           "prod-lip-balm",
			Title:        "Lavender Lip Balm",
			Slug:         "lavender-lip-balm",
			Price:        7.00,
			Category:     "Body & Care",
			Stock:        40,
			InitialStock: 40,
			Image:        "https://www.terrebleu.ca/cdn/shop/files/Lip_Balm_white_background_sie.png?v=1767141428&width=1080",
			Description:  "100% natural beeswax balm with cold-pressed botanical oils and gentle lavender notes.",
			Featured:     false,
		},
		{
			ID:           "prod-bouquet",
			Title:        "Dried Lavender Bouquet",
			Slug:         "dried-lavender-bouquet",
			Price:        24.00,
			Category:     "Botanicals",
			Stock:        15,
			InitialStock: 15,
			Image:        "https://www.terrebleu.ca/cdn/shop/products/bouquetphoto2.jpg?v=1774540621&width=1080",
			Description:  "Naturally sun-dried artisanal lavender bundle with lasting fragrance and timeless field aesthetics.",
			Featured:     true,
		},
		{
			ID:           "prod-shortbread",
			Title:        "Lavender & Lemon Shortbread",
			Slug:         "lavender-shortbread",
			Price:        20.00,
			Category:     "Culinary",
			Stock:        20,
			InitialStock: 20,
			Image:        "https://www.terrebleu.ca/cdn/shop/products/shortbreadcookies_newproductimage.png?v=1679949384&width=1080",
			Description:  "Handcrafted butter shortbread infused with culinary organic lavender buds and fresh lemon zest.",
			Featured:     false,
		},
		{
			ID:           "prod-bath-soak",
			Title:        "Lavender Bath Soak",
			Slug:         "lavender-bath-soak",
			Price:        24.00,
			Category:     "Bath & Spa",
			Stock:        16,
			InitialStock: 16,
			Image:        "https://www.terrebleu.ca/cdn/shop/products/Terre_Bleu_New_Arrivals_Extras-3.jpg?v=1774540916&width=1080",
			Description:  "Mineral-rich Dead Sea salts blended with French lavender essential oil and dried botanical petals.",
			Featured:     false,
		},
		{
			ID:           "prod-essential-oil",
			Title:        "Phenomenal French Lavender Oil",
			Slug:         "phenomenal-essential-oil",
			Price:        20.00,
			Category:     "Wellness",
			Stock:        30,
			InitialStock: 30,
			Image:        "https://www.terrebleu.ca/cdn/shop/products/Phenomenal_bottle_5mL_white_background.jpg?v=1774541513&width=1080",
			Description:  "100% pure steam-distilled essential oil harvested directly from our highest-potency lavender cultivars.",
			Featured:     false,
		},
	}

	for _, p := range defaultProducts {
		s.products[p.ID] = p
	}
}

func (s *Store) GetProducts() []*Product {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]*Product, 0, len(s.products))
	for _, p := range s.products {
		res = append(res, p)
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
		ID:           orderID,
		CustomerName: req.CustomerName,
		Items:        orderItems,
		TotalItems:   totalItems,
		Total:        total,
		Status:       "completed",
		CardLast4:    last4,
		CreatedAt:    time.Now(),
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
