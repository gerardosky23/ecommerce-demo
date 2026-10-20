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
  shippingAddress?: string;
  shippingCity?: string;
  items: OrderItem[];
  totalItems: number;
  total: number;
  status: string;
  cardLast4: string;
  createdAt: string;
}

// Fallback initial products in Spanish
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-comfort-edit",
    title: "Set Botánico The Comfort Edit",
    slug: "the-comfort-edit",
    price: 45.00,
    compareAt: 60.00,
    category: "Sets Exclusivos",
    stock: 14,
    initialStock: 14,
    image: "https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080",
    description: "Una invitación a desacelerar, descansar y encontrar la calma. Incluye: Sales de Baño de Lavanda, Capullos Aromáticos y Agua Floral Pura.",
    featured: true,
  },
  {
    id: "prod-hand-cream",
    title: "Crema de Manos Lavanda y Cítricos",
    slug: "lavender-citrus-hand-cream",
    price: 27.00,
    category: "Cuidado Corporal",
    stock: 25,
    initialStock: 25,
    image: "https://www.terrebleu.ca/cdn/shop/files/Lavender_Citrus_Hand_Cream_White_Background_Nov_2024.jpg?v=1767139266&width=1080",
    description: "Fórmula botánica de nutrición profunda infusionada con lavanda orgánica pura y esencias cítricas revitalizantes.",
    featured: true,
  },
  {
    id: "prod-kids-roll-on",
    title: "Roll-on Relajante de Lavanda Infantil",
    slug: "dreamy-lavender-roll-on",
    price: 18.00,
    category: "Bienestar",
    stock: 18,
    initialStock: 18,
    image: "https://www.terrebleu.ca/cdn/shop/files/Dreamy_Lavender_Roll_on_10ml_upright_white_background.png?v=1774540781&width=1080",
    description: "Suave aceite esencial roll-on de 10ml especialmente formulado para rutinas nocturnas y descanso sereno.",
    featured: true,
  },
  {
    id: "prod-lip-balm",
    title: "Bálsamo Labial de Lavanda Natural",
    slug: "lavender-lip-balm",
    price: 7.00,
    category: "Cuidado Corporal",
    stock: 40,
    initialStock: 40,
    image: "https://www.terrebleu.ca/cdn/shop/files/Lip_Balm_white_background_sie.png?v=1767141428&width=1080",
    description: "Bálsamo 100% natural a base de cera de abejas con aceites botánicos prensados en frío y suaves notas de lavanda.",
    featured: false,
  },
  {
    id: "prod-bouquet",
    title: "Ramo de Lavanda Seca Artesanal",
    slug: "dried-lavender-bouquet",
    price: 24.00,
    category: "Botánica y Hogar",
    stock: 15,
    initialStock: 15,
    image: "https://www.terrebleu.ca/cdn/shop/products/bouquetphoto2.jpg?v=1774540621&width=1080",
    description: "Ramillete de lavanda secado naturalmente al sol con fragancia duradera y estética campestre atemporal.",
    featured: true,
  },
  {
    id: "prod-shortbread",
    title: "Galletas de Mantequilla, Lavanda y Limón",
    slug: "lavender-shortbread",
    price: 20.00,
    category: "Gourmet y Culinario",
    stock: 20,
    initialStock: 20,
    image: "https://www.terrebleu.ca/cdn/shop/products/shortbreadcookies_newproductimage.png?v=1679949384&width=1080",
    description: "Galletas artesanales de pura mantequilla infusionadas con flores de lavanda orgánica y ralladura de limón fresco.",
    featured: false,
  },
  {
    id: "prod-bath-soak",
    title: "Sales de Baño Minerales con Lavanda",
    slug: "lavender-bath-soak",
    price: 24.00,
    category: "Baño y Spa",
    stock: 16,
    initialStock: 16,
    image: "https://www.terrebleu.ca/cdn/shop/products/Terre_Bleu_New_Arrivals_Extras-3.jpg?v=1774540916&width=1080",
    description: "Sales minerales del Mar Muerto combinadas con aceite esencial de lavanda francesa y pétalos botánicos secos.",
    featured: false,
  },
  {
    id: "prod-essential-oil",
    title: "Aceite Esencial Puro de Lavanda Francesa",
    slug: "phenomenal-essential-oil",
    price: 20.00,
    category: "Bienestar",
    stock: 30,
    initialStock: 30,
    image: "https://www.terrebleu.ca/cdn/shop/products/Phenomenal_bottle_5mL_white_background.jpg?v=1774541513&width=1080",
    description: "Aceite esencial 100% puro destilado al vapor, obtenido directamente de nuestros cultivares de lavanda de mayor potencia aromática.",
    featured: false,
  },
];

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '/api';
  const hostname = window.location.hostname;
  const port = window.location.port;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '4321' || port === '3000')) {
    return 'http://localhost:8080/api';
  }
  return '/api';
}

class StoreState {
  products = $state<Product[]>(DEFAULT_PRODUCTS);
  cart = $state<CartItem[]>([]);
  orders = $state<Order[]>([]);
  activeCustomerName = $state<string>('');
  customerAddress = $state<string>('');
  customerCity = $state<string>('');
  
  // UI states
  isCartOpen = $state<boolean>(false);
  isCheckoutOpen = $state<boolean>(false);
  isProfileOpen = $state<boolean>(false);
  isTrackingOpen = $state<boolean>(false);
  trackingOrder = $state<Order | null>(null);
  selectedProduct = $state<Product | null>(null);
  lastCompletedOrder = $state<Order | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  // Derived calculations
  cartTotalItems = $derived(this.cart.reduce((sum, item) => sum + item.quantity, 0));
  cartSubtotal = $derived(this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  
  // Orders for current active customer
  customerOrders = $derived(
    this.activeCustomerName.trim() === ''
      ? this.orders
      : this.orders.filter(o => o.customerName.toLowerCase() === this.activeCustomerName.trim().toLowerCase())
  );

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedName = localStorage.getItem('tb_customer_name');
      if (savedName) this.activeCustomerName = savedName;

      const savedAddress = localStorage.getItem('tb_customer_address');
      if (savedAddress) this.customerAddress = savedAddress;

      const savedCity = localStorage.getItem('tb_customer_city');
      if (savedCity) this.customerCity = savedCity;

      const savedCart = localStorage.getItem('tb_cart_items');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cart = parsed;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('tb_cart_items', JSON.stringify(this.cart));
      if (this.activeCustomerName) {
        localStorage.setItem('tb_customer_name', this.activeCustomerName);
      }
      if (this.customerAddress) {
        localStorage.setItem('tb_customer_address', this.customerAddress);
      }
      if (this.customerCity) {
        localStorage.setItem('tb_customer_city', this.customerCity);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  login(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.activeCustomerName = trimmed;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tb_customer_name', trimmed);
    }
    this.saveToStorage();
    this.fetchOrders();
  }

  logout() {
    this.activeCustomerName = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tb_customer_name');
    }
    this.saveToStorage();
  }

  openTracking(order: Order) {
    this.trackingOrder = order;
    this.isTrackingOpen = true;
  }

  closeTracking() {
    this.isTrackingOpen = false;
    this.trackingOrder = null;
  }

  async fetchProducts() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/products`);
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
      const res = await fetch(`${getApiBaseUrl()}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.orders = data;
        }
      }
    } catch (e) {}
  }

  addToCart(product: Product, quantity = 1) {
    if (product.stock <= 0) return;
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
    this.saveToStorage();
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
    this.saveToStorage();
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter(it => it.product.id !== productId);
    this.saveToStorage();
  }

  async submitCheckout(
    customerName: string,
    shippingAddress = '',
    shippingCity = ''
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    const name = customerName.trim() || this.activeCustomerName || 'Cliente Demostración';
    this.activeCustomerName = name;
    if (shippingAddress.trim()) {
      this.customerAddress = shippingAddress.trim();
    }
    if (shippingCity.trim()) {
      this.customerCity = shippingCity.trim();
    }
    this.saveToStorage();

    // Validate that no item in cart is sold out
    for (const item of this.cart) {
      if (item.product.stock <= 0 || item.quantity > item.product.stock) {
        return {
          success: false,
          error: `El producto "${item.product.title}" no cuenta con existencias suficientes.`
        };
      }
    }

    const payload = {
      customerName: name,
      shippingAddress: this.customerAddress || 'Dirección de Entrega',
      shippingCity: this.customerCity || '',
      cardNumber: '4242',
      items: this.cart.map(it => ({
        productId: it.product.id,
        quantity: it.quantity
      }))
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/checkout`, {
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
        this.saveToStorage();
        
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
        shippingAddress: this.customerAddress || 'Dirección de Entrega',
        shippingCity: this.customerCity || '',
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
      this.saveToStorage();
      return { success: true, order };
    }
  }
}

export const store = new StoreState();
