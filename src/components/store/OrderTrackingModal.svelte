<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { store } from '../../lib/store.svelte';

  // Territorio base: Lima, Perú
  const WAREHOUSE_COORDS: [number, number] = [-12.0969, -77.0354]; // San Isidro
  const PERU_BOUNDS: [[number, number], [number, number]] = [
    [-18.35, -81.33],
    [-0.03, -68.65],
  ];
  const CARTO_API_KEY = 'cb1_4pm2_1_200f6c4d689008428bc823c8';

  type VehicleType = 'moto' | 'auto' | 'camion';

  interface VehicleInfo {
    name: string;
    speed: number;
    description: string;
  }

  const VEHICLES: Record<VehicleType, VehicleInfo> = {
    moto: {
      name: 'Moto Reparto',
      speed: 45,
      description: 'ETA ágil para paquetería express botánica',
    },
    auto: {
      name: 'Auto Express',
      speed: 35,
      description: 'Entrega estándar protegida climatizada',
    },
    camion: {
      name: 'Camión Logístico',
      speed: 25,
      description: 'Carga pesada de almacén y distribución mayorista',
    },
  };

  // Svelte 5 Runes State
  let selectedVehicle = $state<VehicleType>('auto');
  let simMultiplier = $state<1 | 2 | 5>(1);
  let isPaused = $state(false);
  let progress = $state(0); // 0.0 to 1.0
  let isDelivered = $state(false);
  let routeCoords = $state<[number, number][]>([]);
  let cumulativeDistances = $state<number[]>([]);
  let totalDistanceM = $state(0);
  let isLoadingRoute = $state(true);
  let resolvedAddress = $state('');

  // DOM References & Leaflet Objects
  let mapContainerEl: HTMLDivElement | null = $state(null);
  let L: any = null;
  let mapInstance: any = null;
  let polylineLayer: any = null;
  let vehicleMarker: any = null;
  let warehouseMarker: any = null;
  let destMarker: any = null;
  let animFrameId: number | null = null;
  let lastTimestamp = 0;
  let resizeTimeout: any = null;
  let initSessionId = 0;

  // HTML sanitization helper for marker popups and tooltips
  function escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Derived telemetry
  let currentVehicle = $derived(VEHICLES[selectedVehicle]);
  let speedKmH = $derived(currentVehicle.speed);
  let remainingMeters = $derived(Math.max(0, totalDistanceM * (1 - progress)));
  let remainingKmStr = $derived(isLoadingRoute ? '--' : (remainingMeters / 1000).toFixed(1));
  let progressPct = $derived(isLoadingRoute ? 0 : Math.min(100, Math.round(progress * 100)));

  let etaSeconds = $derived.by(() => {
    if (isLoadingRoute || isDelivered || remainingMeters <= 0) return 0;
    const speedMps = (speedKmH * 1000) / 3600;
    return Math.round(remainingMeters / speedMps);
  });

  let etaStr = $derived.by(() => {
    if (isLoadingRoute) return '--';
    if (isDelivered || progress >= 1) return '0 min 00 s';
    const m = Math.floor(etaSeconds / 60);
    const s = etaSeconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  });

  function close() {
    cleanupMap();
    store.closeTracking();
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  // Haversine formula for distance between 2 coordinates in meters
  function haversineMeters(p1: [number, number], p2: [number, number]): number {
    const R = 6371000;
    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1[0] * Math.PI) / 180) *
        Math.cos((p2[0] * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Deterministic realistic fallback for Lima Metropolitan area
  function getFallbackCoordinates(address?: string | null): [number, number] {
    const safe = address || 'Lima';
    const norm = safe.toLowerCase();
    if (norm.includes('miraflor')) return [-12.121, -77.029];
    if (norm.includes('borja')) return [-12.086, -77.001];
    if (norm.includes('surco')) return [-12.138, -76.993];
    if (norm.includes('jesus') || norm.includes('jesús')) return [-12.072, -77.050];
    if (norm.includes('begonia') || norm.includes('isidro')) return [-12.092, -77.032];

    const fallbackList: [number, number][] = [
      [-12.121, -77.029], // Miraflores
      [-12.086, -77.001], // San Borja
      [-12.138, -76.993], // Surco
      [-12.072, -77.050], // Jesús María
      [-12.092, -77.032], // San Isidro Begonias
    ];
    let hash = 0;
    for (let i = 0; i < safe.length; i++) {
      hash = (hash << 5) - hash + safe.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % fallbackList.length;
    return fallbackList[idx];
  }

  // Geocoding via Nominatim OSM limited to Peru
  async function geocodeAddress(address: string, city: string = 'Lima'): Promise<[number, number]> {
    if (!address || address.trim() === '') {
      return getFallbackCoordinates('San Isidro');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const query = `${address}, ${city}, Peru`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=pe&format=json&limit=1`,
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          // Verify inside Peru bounds
          if (
            lat >= PERU_BOUNDS[0][0] &&
            lat <= PERU_BOUNDS[1][0] &&
            lng >= PERU_BOUNDS[0][1] &&
            lng <= PERU_BOUNDS[1][1]
          ) {
            return [lat, lng];
          }
        }
      }
    } catch {
      // Network failure or abort -> fall through to smart fallback
    }

    return getFallbackCoordinates(address);
  }

  // Generate realistic turn-by-turn fallback route through Lima street grid
  function generateFallbackRoute(
    origin: [number, number],
    dest: [number, number]
  ): [number, number][] {
    const dLat = dest[0] - origin[0];
    const dLng = dest[1] - origin[1];

    // Create 3 realistic grid-axis turn waypoints
    const wp1: [number, number] = [origin[0] + dLat * 0.1, origin[1] + dLng * 0.45];
    const wp2: [number, number] = [origin[0] + dLat * 0.55, origin[1] + dLng * 0.5];
    const wp3: [number, number] = [origin[0] + dLat * 0.85, origin[1] + dLng * 0.9];

    const milestones = [origin, wp1, wp2, wp3, dest];
    const points: [number, number][] = [];

    for (let m = 0; m < milestones.length - 1; m++) {
      const start = milestones[m];
      const end = milestones[m + 1];
      const subSteps = 10;
      for (let s = 0; s < subSteps; s++) {
        const t = s / subSteps;
        points.push([
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
        ]);
      }
    }
    points.push(dest);
    return points;
  }

  // Fetch actual street route via OSRM Driving API
  async function fetchRoute(
    origin: [number, number],
    dest: [number, number]
  ): Promise<{ coords: [number, number][]; distance: number }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const rawCoords = data.routes[0].geometry.coordinates as [number, number][];
          // OSRM returns [lng, lat], convert to [lat, lng] for Leaflet
          const converted: [number, number][] = rawCoords.map((c) => [c[1], c[0]]);
          const distance = data.routes[0].distance || 0;
          return { coords: converted, distance };
        }
      }
    } catch {
      // Timeout or offline fallback
    }

    // Fallback interpolated path
    const fallbackCoords = generateFallbackRoute(origin, dest);
    let totalD = 0;
    for (let i = 1; i < fallbackCoords.length; i++) {
      totalD += haversineMeters(fallbackCoords[i - 1], fallbackCoords[i]);
    }
    return { coords: fallbackCoords, distance: totalD };
  }

  // Calculate cumulative distances for smooth progress interpolation
  function computeCumulativeDistances(coords: [number, number][]): number[] {
    const arr: number[] = [0];
    for (let i = 1; i < coords.length; i++) {
      const d = haversineMeters(coords[i - 1], coords[i]);
      arr.push(arr[i - 1] + d);
    }
    return arr;
  }

  function getLatLngAtProgress(
    p: number,
    coords: [number, number][],
    cumulative: number[]
  ): [number, number] {
    if (coords.length === 0) return WAREHOUSE_COORDS;
    if (p <= 0) return coords[0];
    const maxDist = cumulative[cumulative.length - 1];
    if (p >= 1 || maxDist <= 0) return coords[coords.length - 1];

    const targetDist = p * maxDist;
    let i = 0;
    while (i < cumulative.length - 1 && cumulative[i + 1] < targetDist) {
      i++;
    }

    const segStart = cumulative[i];
    const segEnd = cumulative[i + 1];
    const segLen = segEnd - segStart;
    if (segLen <= 0) return coords[i];

    const ratio = (targetDist - segStart) / segLen;
    const lat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * ratio;
    const lng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * ratio;
    return [lat, lng];
  }

  // Leaflet custom marker icons
  function createVehicleIcon(leaflet: any, vehicleKey: VehicleType) {
    let svgIcon = '';
    let label = 'Vehículo';

    if (vehicleKey === 'moto') {
      label = 'Moto 45km/h';
      svgIcon = `<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="18" r="3" stroke-width="2"/><circle cx="19" cy="18" r="3" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18V8l3-3h3m-6 3h-3l-2 5h7"/></svg>`;
    } else if (vehicleKey === 'auto') {
      label = 'Auto 35km/h';
      svgIcon = `<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="7" cy="17" r="2" stroke-width="2"/><circle cx="17" cy="17" r="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-4l2-5h10l2 5v4h-2m-6 0h4"/></svg>`;
    } else {
      label = 'Camión 25km/h';
      svgIcon = `<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="7" cy="17" r="2" stroke-width="2"/><circle cx="17" cy="17" r="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17V5a1 1 0 011-1h10v13H3zm10-8h4l2 3v5h-6V9z"/></svg>`;
    }

    return leaflet.divIcon({
      className: 'tb-vehicle-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
          <div style="background:#0284c7; border:2px solid #ffffff; box-shadow:0 3px 8px rgba(2,132,199,0.4); border-radius:9999px; width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:#ffffff;">
            ${svgIcon}
          </div>
          <div style="background:#0f172a; color:#ffffff; font-size:9px; font-weight:700; padding:1px 6px; border-radius:4px; margin-top:3px; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.25); letter-spacing:0.02em;">
            ${label}
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }

  function createWarehouseIcon(leaflet: any) {
    return leaflet.divIcon({
      className: 'tb-warehouse-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#0f172a; border:2px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.3); border-radius:6px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#ffffff;">
            <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div style="background:#0f172a; color:#ffffff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.25);">
            Almacén San Isidro
          </div>
        </div>
      `,
      iconSize: [32, 50],
      iconAnchor: [16, 50],
    });
  }

  function createDestIcon(leaflet: any, address: string) {
    const raw = address || 'Destino';
    const clean = raw.length > 20 ? raw.slice(0, 18) + '...' : raw;
    const escaped = escapeHtml(clean);
    return leaflet.divIcon({
      className: 'tb-dest-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#059669; border:2px solid #ffffff; box-shadow:0 2px 8px rgba(5,150,105,0.35); border-radius:6px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#ffffff;">
            <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div style="background:#059669; color:#ffffff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.25);">
            ${escaped}
          </div>
        </div>
      `,
      iconSize: [32, 50],
      iconAnchor: [16, 50],
    });
  }

  // Animation Step Loop
  function stepAnimation(timestamp: number) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaSec = Math.min((timestamp - lastTimestamp) / 1000, 0.5);
    lastTimestamp = timestamp;

    if (!isPaused && !isDelivered && routeCoords.length > 0) {
      // Base duration: 20s at 1x; adjusted by vehicle speed and multiplier
      const baseDurationSec = 20;
      const vehicleFactor = speedKmH / 35;
      const step = (deltaSec / baseDurationSec) * vehicleFactor * simMultiplier;

      progress = Math.min(1, progress + step);

      if (vehicleMarker && cumulativeDistances.length > 0) {
        const currentPos = getLatLngAtProgress(progress, routeCoords, cumulativeDistances);
        vehicleMarker.setLatLng(currentPos);
      }

      if (progress >= 1) {
        progress = 1;
        isDelivered = true;
        animFrameId = null;
        return; // Complete animation and release frame loop
      }
    }

    if (store.isTrackingOpen && !isDelivered && !isPaused) {
      animFrameId = requestAnimationFrame(stepAnimation);
    } else {
      animFrameId = null;
    }
  }

  // Initialize Leaflet Map
  async function initializeMap() {
    if (typeof window === 'undefined' || !mapContainerEl) return;

    // Clean up previous instance if any and invalidate old sessions
    cleanupMap();

    const sessionId = ++initSessionId;

    try {
      // Dynamic import of Leaflet for SSR compatibility
      const leafletModule = await import('leaflet');
      if (sessionId !== initSessionId || !store.isTrackingOpen) return;
      L = leafletModule.default || leafletModule;

      if (!L || !mapContainerEl) return;

      // Reset animation state
      progress = 0;
      isDelivered = false;
      isPaused = false;
      lastTimestamp = 0;
      isLoadingRoute = true;

      // Initialize Leaflet map with CartoDB Positron and Peru limits
      mapInstance = L.map(mapContainerEl, {
        center: WAREHOUSE_COORDS,
        zoom: 13,
        minZoom: 6,
        maxBounds: PERU_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

      // CartoDB Positron Minimalist light layer with authorized CARTO API Key
      L.tileLayer(`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add Warehouse Marker
      warehouseMarker = L.marker(WAREHOUSE_COORDS, {
        icon: createWarehouseIcon(L),
      }).addTo(mapInstance);
      warehouseMarker.bindPopup('<strong>Almacén Central Terre Bleu</strong><br>San Isidro, Lima, Perú');

      // Geocode customer delivery address
      const order = store.trackingOrder;
      const address = order?.shippingAddress || 'San Isidro, Lima';
      resolvedAddress = address;

      const destCoords = await geocodeAddress(address, order?.shippingCity || 'Lima');
      if (sessionId !== initSessionId || !mapInstance || !store.isTrackingOpen) return;

      // Add Destination Marker
      destMarker = L.marker(destCoords, {
        icon: createDestIcon(L, address),
      }).addTo(mapInstance);
      destMarker.bindPopup(`<strong>Destino de Entrega</strong><br>${escapeHtml(address)}`);

      // Fetch Real Street Route via OSRM
      const routeResult = await fetchRoute(WAREHOUSE_COORDS, destCoords);
      if (sessionId !== initSessionId || !mapInstance || !store.isTrackingOpen) return;

      routeCoords = routeResult.coords;
      totalDistanceM = routeResult.distance;
      cumulativeDistances = computeCumulativeDistances(routeCoords);

      // Draw polyline in azure blue (#0284c7)
      polylineLayer = L.polyline(routeCoords, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(mapInstance);

      // Add moving vehicle marker at start
      vehicleMarker = L.marker(WAREHOUSE_COORDS, {
        icon: createVehicleIcon(L, selectedVehicle),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      // Auto-fit bounds
      if (routeCoords.length > 0 && mapInstance) {
        mapInstance.fitBounds(polylineLayer.getBounds(), {
          padding: [36, 36],
          maxZoom: 16,
        });
      }

      isLoadingRoute = false;

      // Invalidate size to guarantee tile display after modal rendering
      resizeTimeout = setTimeout(() => {
        if (mapInstance && sessionId === initSessionId) {
          mapInstance.invalidateSize();
        }
      }, 250);

      // Start animation loop
      if (animFrameId) cancelAnimationFrame(animFrameId);
      lastTimestamp = 0;
      animFrameId = requestAnimationFrame(stepAnimation);
    } catch (err) {
      if (sessionId === initSessionId) {
        console.error('Error initializing Leaflet map in OrderTrackingModal:', err);
        isLoadingRoute = false;
      }
    }
  }

  function cleanupMap() {
    initSessionId++;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    if (mapInstance) {
      try {
        mapInstance.remove();
      } catch {}
      mapInstance = null;
    }
    if (mapContainerEl) {
      try {
        delete (mapContainerEl as any)._leaflet_id;
      } catch {}
    }
    vehicleMarker = null;
    polylineLayer = null;
    warehouseMarker = null;
    destMarker = null;
    routeCoords = [];
    cumulativeDistances = [];
  }

  function selectVehicle(v: VehicleType) {
    selectedVehicle = v;
    if (vehicleMarker && L) {
      vehicleMarker.setIcon(createVehicleIcon(L, v));
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    if (!isPaused && !isDelivered && store.isTrackingOpen) {
      lastTimestamp = 0;
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(stepAnimation);
      }
    }
  }

  function restartRoute() {
    progress = 0;
    isDelivered = false;
    isPaused = false;
    lastTimestamp = 0;
    if (vehicleMarker && routeCoords.length > 0) {
      vehicleMarker.setLatLng(routeCoords[0]);
    }
    if (store.isTrackingOpen && !animFrameId) {
      animFrameId = requestAnimationFrame(stepAnimation);
    }
  }

  function setMultiplier(m: 1 | 2 | 5) {
    simMultiplier = m;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && store.isTrackingOpen) {
      close();
    }
  }

  function handleWindowResize() {
    if (mapInstance && store.isTrackingOpen) {
      mapInstance.invalidateSize();
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleWindowResize);
    }
  });

  onDestroy(() => {
    cleanupMap();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowResize);
    }
  });

  // Reactive Effect: Initialize map whenever modal opens
  $effect(() => {
    if (store.isTrackingOpen && store.trackingOrder && mapContainerEl) {
      initializeMap();
    } else if (!store.isTrackingOpen) {
      cleanupMap();
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

{#if store.isTrackingOpen && store.trackingOrder}
  {@const order = store.trackingOrder}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60">
    <button
      type="button"
      aria-label="Cerrar seguimiento"
      class="absolute inset-0 bg-transparent w-full h-full border-none cursor-default"
      onclick={close}
    ></button>

    <div
      class="relative bg-white border border-slate-200 rounded-lg max-w-2xl w-full overflow-hidden shadow-sm z-10 p-5 sm:p-7 space-y-5 text-slate-900 max-h-[94vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-lg sm:text-xl font-serif font-bold text-slate-950">Seguimiento de Pedido</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              #{order.id}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Módulo de Rastreo GPS Satelital — Despacho y telemetría de ruta en tiempo real.
          </p>
        </div>

        <button
          type="button"
          aria-label="Cerrar ventana"
          onclick={close}
          class="w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Order Details Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Destinatario</span>
          <span class="font-bold text-slate-900 block">{order.customerName}</span>
          <span class="text-slate-500 text-[11px] block">{formatDate(order.createdAt)}</span>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Dirección de Entrega</span>
          <span class="font-medium text-slate-900 block truncate" title={order.shippingAddress || 'Dirección no especificada'}>
            {order.shippingAddress || 'Dirección de Entrega Registrada'}
          </span>
          {#if order.shippingCity}
            <span class="text-slate-500 text-[11px] block">{order.shippingCity}</span>
          {/if}
        </div>
      </div>

      <!-- Shipping Progress Stepper -->
      <div class="space-y-2 pt-1">
        <div class="flex justify-between items-center text-[11px] font-medium text-slate-600">
          <span class="text-slate-900 font-semibold">Estado de la entrega:</span>
          {#if isDelivered}
            <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Pedido Entregado con Éxito!</span>
            </span>
          {:else}
            <span class="px-2.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              En proceso de despacho
            </span>
          {/if}
        </div>

        <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-slate-900"></div>
            <span class="text-slate-800 font-medium">Recibido</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-slate-900"></div>
            <span class="text-slate-800 font-medium">Empaque</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full {isDelivered ? 'bg-slate-900' : 'bg-sky-600 animate-pulse'}"></div>
            <span class="{isDelivered ? 'text-slate-800 font-medium' : 'text-sky-700 font-bold'}">En camino</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full {isDelivered ? 'bg-emerald-600' : 'bg-slate-200'}"></div>
            <span class="{isDelivered ? 'text-emerald-700 font-bold' : 'text-slate-400'}">Entregado</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Selector -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-medium text-slate-700">Vehículo de Despacho:</span>
          <span class="text-slate-500 text-[10px]">{currentVehicle.description}</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <!-- Moto -->
          <button
            type="button"
            id="btn-tracking-v-moto"
            onclick={() => selectVehicle('moto')}
            class="flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer {selectedVehicle === 'moto'
              ? 'bg-sky-50 text-sky-900 border-sky-500 font-semibold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
          >
            <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="18" r="3" stroke-width="2" />
              <circle cx="19" cy="18" r="3" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18V8l3-3h3m-6 3h-3l-2 5h7" />
            </svg>
            <div class="text-left leading-tight">
              <span class="block text-[11px] font-semibold">Moto</span>
              <span class="block text-[10px] text-slate-500 tabular-nums">45 km/h</span>
            </div>
          </button>

          <!-- Auto -->
          <button
            type="button"
            id="btn-tracking-v-auto"
            onclick={() => selectVehicle('auto')}
            class="flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer {selectedVehicle === 'auto'
              ? 'bg-sky-50 text-sky-900 border-sky-500 font-semibold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
          >
            <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="7" cy="17" r="2" stroke-width="2" />
              <circle cx="17" cy="17" r="2" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-4l2-5h10l2 5v4h-2m-6 0h4" />
            </svg>
            <div class="text-left leading-tight">
              <span class="block text-[11px] font-semibold">Auto</span>
              <span class="block text-[10px] text-slate-500 tabular-nums">35 km/h</span>
            </div>
          </button>

          <!-- Camión -->
          <button
            type="button"
            id="btn-tracking-v-camion"
            onclick={() => selectVehicle('camion')}
            class="flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer {selectedVehicle === 'camion'
              ? 'bg-sky-50 text-sky-900 border-sky-500 font-semibold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
          >
            <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="7" cy="17" r="2" stroke-width="2" />
              <circle cx="17" cy="17" r="2" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17V5a1 1 0 011-1h10v13H3zm10-8h4l2 3v5h-6V9z" />
            </svg>
            <div class="text-left leading-tight">
              <span class="block text-[11px] font-semibold">Camión</span>
              <span class="block text-[10px] text-slate-500 tabular-nums">25 km/h</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Leaflet Interactive Map View (CartoDB Positron) -->
      <div class="relative w-full h-72 sm:h-80 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
        <div id="leaflet-order-map" bind:this={mapContainerEl} class="w-full h-full z-0"></div>

        {#if isLoadingRoute}
          <div class="absolute inset-0 bg-white/95 flex flex-col items-center justify-center space-y-2 z-10">
            <div class="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-mono text-slate-600">Calculando ruteo vial por calles reales (OSRM)...</span>
          </div>
        {/if}

        <!-- Delivered Overlay -->
        {#if isDelivered}
          <div class="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white px-3.5 py-1.5 rounded-md shadow-sm flex items-center space-x-1.5 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>¡Pedido Entregado con Éxito!</span>
          </div>
        {/if}
      </div>

      <!-- Live Telemetry Bar -->
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div class="bg-white border border-slate-200 rounded p-2">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Dist. Restante</span>
            <span class="text-sm font-bold text-slate-900 tabular-nums block mt-0.5">
              {remainingKmStr} <span class="text-[10px] font-normal text-slate-500">km</span>
            </span>
          </div>

          <div class="bg-white border border-slate-200 rounded p-2">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">ETA Regresivo</span>
            <span class="text-sm font-bold text-sky-700 tabular-nums block mt-0.5">
              {etaStr}
            </span>
          </div>

          <div class="bg-white border border-slate-200 rounded p-2">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Velocidad</span>
            <span class="text-sm font-bold text-slate-900 tabular-nums block mt-0.5">
              {speedKmH} <span class="text-[10px] font-normal text-slate-500">km/h</span>
            </span>
          </div>

          <div class="bg-white border border-slate-200 rounded p-2">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Progreso</span>
            <span class="text-sm font-bold text-slate-900 tabular-nums block mt-0.5">
              {progressPct}%
            </span>
          </div>
        </div>

        <!-- Progress Track -->
        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full bg-sky-600 transition-all duration-100 rounded-full"
            style="width: {progressPct}%;"
          ></div>
        </div>
      </div>

      <!-- Simulation Playback Controls -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div class="flex items-center space-x-2">
          <!-- Play / Pause -->
          <button
            type="button"
            id="btn-tracking-pause"
            onclick={togglePause}
            class="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            {#if isPaused}
              <svg class="w-3.5 h-3.5 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Reanudar</span>
            {:else}
              <svg class="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              <span>Pausar</span>
            {/if}
          </button>

          <!-- Restart Route -->
          <button
            type="button"
            id="btn-tracking-restart"
            onclick={restartRoute}
            class="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reiniciar Ruta</span>
          </button>
        </div>

        <!-- Simulation Multipliers -->
        <div class="flex items-center space-x-1 text-xs">
          <span class="text-[11px] text-slate-500 mr-1">Velocidad:</span>
          {#each [1, 2, 5] as const as mul}
            <button
              type="button"
              id="btn-tracking-speed-{mul}"
              onclick={() => setMultiplier(mul)}
              class="px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer {simMultiplier === mul
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              {mul}x
            </button>
          {/each}
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-1">
        <button
          onclick={close}
          class="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors cursor-pointer text-center"
        >
          Cerrar Seguimiento
        </button>
      </div>
    </div>
  </div>
{/if}