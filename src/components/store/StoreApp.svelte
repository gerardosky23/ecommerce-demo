<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { store, getApiBaseUrl } from '../../lib/store.svelte';
  import Navbar from './Navbar.svelte';
  import Hero from './Hero.svelte';
  import CuratedEdit from './CuratedEdit.svelte';
  import HomeSpotlight from './HomeSpotlight.svelte';
  import ProductModal from './ProductModal.svelte';
  import CartDrawer from './CartDrawer.svelte';
  import CheckoutModal from './CheckoutModal.svelte';
  import ProfileDrawer from './ProfileDrawer.svelte';
  import OrderTrackingModal from './OrderTrackingModal.svelte';
  import Footer from './Footer.svelte';

  let eventSource: EventSource | null = null;
  let reconnectTimer: any = null;
  let isDestroyed = false;

  function connectSSE() {
    if (isDestroyed || typeof window === 'undefined') return;

    try {
      if (eventSource) {
        eventSource.close();
      }
      eventSource = new EventSource(`${getApiBaseUrl()}/events`);

      eventSource.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.action === 'order_created' || data.action === 'stock_updated' || data.action === 'demo_reset') {
            store.fetchProducts();
            store.fetchOrders();
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isDestroyed) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connectSSE, 3000);
        }
      };
    } catch (e) {
      if (!isDestroyed) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectSSE, 3000);
      }
    }
  }

  onMount(() => {
    // Initial fetch on mount only
    store.fetchProducts();
    store.fetchOrders();
    // 100% event-driven updates via SSE (Zero polling)
    connectSSE();
  });

  onDestroy(() => {
    isDestroyed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (eventSource) eventSource.close();
  });
</script>

<div class="min-h-screen w-full max-w-[100vw] overflow-x-clip bg-white text-slate-900 antialiased selection:bg-sky-500/10">
  <Navbar />
  <main>
    <Hero />
    <CuratedEdit />
    <HomeSpotlight />
  </main>
  <Footer />

  <!-- Modals & Drawers -->
  <ProductModal />
  <CartDrawer />
  <CheckoutModal />
  <ProfileDrawer />
  <OrderTrackingModal />
</div>
