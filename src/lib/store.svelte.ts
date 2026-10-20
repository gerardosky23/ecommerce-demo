// Svelte 5 Runes Reactive State Store for Terre Bleu Demo Storefront

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAt?: number;
  category: string;
  stock: number;
  initialStock: number;
  image: string;
  description: string;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalItems: number;
  total: number;
  status: string;
  cardLast4: string;
  createdAt: string;
}

// Fallback initial products if server isn't reached yet
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-comfort-edit",
    title: "The Comfort Edit",
    slug: "the-comfort-edit",
    price: 45.00,
    compareAt: 60.00,
    category: "Signature Sets",
    stock: 14,
    initialStock: 14,
    image: "https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080",
    description: "A little invitation to slow down, unwind, and find your calm. Includes: Lavender Bath Soak, Aromatic Bud, Floral Water.",
    featured: true,
  },
  {
    id: "prod-hand-cream",
    title: "Lavender Citrus Hand Cream",
    slug: "lavender-citrus-hand-cream",
    price: 27.00,
    category: "Body & Care",
    stock: 25,
    initialStock: 25,
    image: "https://www.terrebleu.ca/cdn/shop/files/Lavender_Citrus_Hand_Cream_White_Background_Nov_2024.jpg?v=1767139266&width=1080",
    description: "Deeply moisturizing botanical formula infused with pure organic lavender and bright citrus essences.",
    featured: true,
  },
  {
    id: "prod-kids-roll-on",
    title: "Kids Dreamy Lavender Roll On",
    slug: "dreamy-lavender-roll-on",
    price: 18.00,
    category: "Wellness",
    stock: 18,
    initialStock: 18,
    image: "https://www.terrebleu.ca/cdn/shop/files/Dreamy_Lavender_Roll_on_10ml_upright_white_background.png?v=1774540781&width=1080",
    description: "Gentle 10ml essential roll-on crafted specifically for evening routines and tranquil bedtimes.",
    featured: true,
  },
  {
    id: "prod-lip-balm",
    title: "Lavender Lip Balm",
    slug: "lavender-lip-balm",
    price: 7.00,
    category: "Body & Care",
    stock: 40,
    initialStock: 40,
    image: "https://www.terrebleu.ca/cdn/shop/files/Lip_Balm_white_background_sie.png?v=1767141428&width=1080",
    description: "100% natural beeswax balm with cold-pressed botanical oils and gentle lavender notes.",
    featured: false,
  },
  {
    id: "prod-bouquet",
    title: "Dried Lavender Bouquet",
    slug: "dried-lavender-bouquet",
    price: 24.00,
    category: "Botanicals",
    stock: 15,
    initialStock: 15,
    image: "https://www.terrebleu.ca/cdn/shop/products/bouquetphoto2.jpg?v=1774540621&width=1080",
    description: "Naturally sun-dried artisanal lavender bundle with lasting fragrance and timeless field aesthetics.",
    featured: true,
  },
  {
    id: "prod-shortbread",
    title: "Lavender & Lemon Shortbread",
    slug: "lavender-shortbread",
    price: 20.00,
    category: "Culinary",
    stock: 20,
    initialStock: 20,
    image: "https://www.terrebleu.ca/cdn/shop/products/shortbreadcookies_newproductimage.png?v=1679949384&width=1080",
    description: "Handcrafted butter shortbread infused with culinary organic lavender buds and fresh lemon zest.",
    featured: false,
  },
  {
    id: "prod-bath-soak",
    title: "Lavender Bath Soak",
    slug: "lavender-bath-soak",
    price: 24.00,
    category: "Bath & Spa",
    stock: 16,
    initialStock: 16,
    image: "https://www.terrebleu.ca/cdn/shop/products/Terre_Bleu_New_Arrivals_Extras-3.jpg?v=1774540916&width=1080",
    description: "Mineral-rich Dead Sea salts blended with French lavender essential oil and dried botanical petals.",
    featured: false,
  },
  {
    id: "prod-essential-oil",
    title: "Phenomenal French Lavender Oil",
    slug: "phenomenal-essential-oil",
    price: 20.00,
    category: "Wellness",
    stock: 30,
    initialStock: 30,
    image: "https://www.terrebleu.ca/cdn/shop/products/Phenomenal_bottle_5mL_white_background.jpg?v=1774541513&width=1080",
    description: "100% pure steam-distilled essential oil harvested directly from our highest-potency lavender cultivars.",
    featured: false,
  },
];

class StoreState {
  products = $state<Product[]>(DEFAULT_PRODUCTS);
  cart = $state<CartItem[]>([]);
  orders = $state<Order[]>([]);
  activeCustomerName = $state<string>('');
  
  // UI states
  isCartOpen = $state<boolean>(false);
  isCheckoutOpen = $state<boolean>(false);
  isProfileOpen = $state<boolean>(false);
  selectedProduct = $state<Product | null>(null);
  lastCompletedOrder = $state<Order | null>(null);

  // Derived calculations
  cartTotalItems = $derived(this.cart.reduce((sum, item) => sum + item.quantity, 0));
  cartSubtotal = $derived(this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  
  // Orders for current active customer
  customerOrders = $derived(
    this.activeCustomerName.trim() === ''
      ? this.orders
      : this.orders.filter(o => o.customerName.toLowerCase() === this.activeCustomerName.trim().toLowerCase())
  );

  async fetchProducts() {
    try {
      const res = await fetch('http://localhost:8080/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const idOrder = DEFAULT_PRODUCTS.map(p => p.id);
          const sorted = [...data].sort((a, b) => {
            const idxA = idOrder.indexOf(a.id);
            const idxB = idOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.id.localeCompare(b.id);
          });
          this.products = sorted;
        }
      }
    } catch (e) {
      // Keep default products if backend offline
    }
  }

  async fetchOrders() {
    try {
      const res = await fetch('http://localhost:8080/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.orders = data;
        }
      }
    } catch (e) {}
  }

  addToCart(product: Product, quantity = 1) {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity + quantity <= product.stock) {
        existing.quantity += quantity;
      }
    } else {
      if (product.stock >= quantity) {
        this.cart.push({ product, quantity });
      }
    }
    this.isCartOpen = true;
  }

  updateQuantity(productId: string, delta: number) {
    const item = this.cart.find(it => it.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.cart = this.cart.filter(it => it.product.id !== productId);
    } else if (newQty <= item.product.stock) {
      item.quantity = newQty;
    }
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter(it => it.product.id !== productId);
  }

  async submitCheckout(customerName: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    const name = customerName.trim() || 'Cliente Demostración';
    this.activeCustomerName = name;

    const payload = {
      customerName: name,
      cardNumber: '4242',
      items: this.cart.map(it => ({
        productId: it.product.id,
        quantity: it.quantity
      }))
    };

    try {
      const res = await fetch('http://localhost:8080/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        const order: Order = result.order;
        this.lastCompletedOrder = order;
        this.orders = [order, ...this.orders];
        this.cart = []; // clear cart
        
        // Refresh products to get updated stock
        await this.fetchProducts();
        return { success: true, order };
      } else {
        const err = await res.json().catch(() => ({ error: 'Error al procesar compra' }));
        return { success: false, error: err.error || 'Fallo en checkout' };
      }
    } catch (err) {
      // Fallback local processing for standalone client demo
      const localOrderID = `TB-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderItems: OrderItem[] = this.cart.map(it => {
        // decrement stock locally
        it.product.stock -= it.quantity;
        return {
          productId: it.product.id,
          title: it.product.title,
          price: it.product.price,
          quantity: it.quantity,
          subtotal: it.product.price * it.quantity,
          image: it.product.image
        };
      });

      const order: Order = {
        id: localOrderID,
        customerName: name,
        items: orderItems,
        totalItems: this.cartTotalItems,
        total: this.cartSubtotal,
        status: 'completed',
        cardLast4: '4242',
        createdAt: new Date().toISOString()
      };

      this.lastCompletedOrder = order;
      this.orders = [order, ...this.orders];
      this.cart = [];
      return { success: true, order };
    }
  }
}

export const store = new StoreState();
