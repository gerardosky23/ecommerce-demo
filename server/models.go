package main

import "time"

type Product struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Slug        string  `json:"slug"`
	Price       float64 `json:"price"`
	CompareAt   float64 `json:"compareAt,omitempty"`
	Category    string  `json:"category"`
	Stock       int     `json:"stock"`
	InitialStock int    `json:"initialStock"`
	Image       string  `json:"image"`
	Description string  `json:"description"`
	Featured    bool    `json:"featured"`
}

type OrderItem struct {
	ProductID string  `json:"productId"`
	Title     string  `json:"title"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
	Image     string  `json:"image"`
}

type Order struct {
	ID           string      `json:"id"`
	CustomerName string      `json:"customerName"`
	Items        []OrderItem `json:"items"`
	TotalItems   int         `json:"totalItems"`
	Total        float64     `json:"total"`
	Status       string      `json:"status"` // "completed"
	CardLast4    string      `json:"cardLast4"`
	CreatedAt    time.Time   `json:"createdAt"`
}

type Customer struct {
	Name        string    `json:"name"`
	OrdersCount int       `json:"ordersCount"`
	TotalSpent  float64   `json:"totalSpent"`
	LastOrderAt time.Time `json:"lastOrderAt"`
}

type CheckoutRequest struct {
	CustomerName string `json:"customerName"`
	CardNumber   string `json:"cardNumber"`
	Items        []struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}

type Stats struct {
	TotalRevenue   float64 `json:"totalRevenue"`
	TotalOrders    int     `json:"totalOrders"`
	TotalCustomers int     `json:"totalCustomers"`
	TotalUnitsSold int     `json:"totalUnitsSold"`
	TotalStockLeft int     `json:"totalStockLeft"`
}
