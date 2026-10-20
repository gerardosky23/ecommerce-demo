<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { store } from '../../lib/store.svelte';
  import Navbar from './Navbar.svelte';
  import Hero from './Hero.svelte';
  import CuratedEdit from './CuratedEdit.svelte';
  import ProductGrid from './ProductGrid.svelte';
  import ProductModal from './ProductModal.svelte';
  import CartDrawer from './CartDrawer.svelte';
  import CheckoutModal from './CheckoutModal.svelte';
  import ProfileDrawer from './ProfileDrawer.svelte';
  import Footer from './Footer.svelte';

  let eventSource: EventSource | null = null;
  let pollInterval: any = null;

  onMount(() => {
    store.fetchProducts();
    store.fetchOrders();

    // SSE connection with Go backend
    try {
      eventSource = new EventSource('http://localhost:8080/api/events');
      eventSource.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.action === 'order_created' || data.action === 'demo_reset') {
            store.fetchProducts();
            store.fetchOrders();
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('SSE disconnected, fallback active.');
    }

    pollInterval = setInterval(() => {
      store.fetchProducts();
      store.fetchOrders();
    }, 4000);
  });

  onDestroy(() => {
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

<div class="min-h-screen w-full max-w-[100vw] overflow-x-clip bg-[#090a0f] text-slate-200 antialiased selection:bg-sky-500/20">
  <Navbar />
  <main>
    <Hero />
    <CuratedEdit />
    <ProductGrid />
  </main>
  <Footer />

  <!-- Modals & Drawers -->
  <ProductModal />
  <CartDrawer />
  <CheckoutModal />
  <ProfileDrawer />
</div>
