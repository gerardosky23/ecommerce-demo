<script lang="ts">
  interface Props {
    name: string;
    class?: string;
  }

  let { name, class: className = "w-4 h-4" }: Props = $props();
</script>

{#if name === 'bank'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z" />
  </svg>
{:else if name === 'graph'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
{:else if name === 'box'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
{:else if name === 'globe'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
{:else if name === 'kanban'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="5" height="16" rx="1" />
    <rect x="10" y="4" width="5" height="10" rx="1" />
    <rect x="17" y="4" width="5" height="14" rx="1" />
  </svg>
{:else if name === 'stars'}
  <svg class={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
{:else if name === 'cash-coin'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12h.01M18 12h.01" />
  </svg>
{:else if name === 'people' || name === 'users'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
{:else if name === 'gear'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
{:else if name === 'journal-check'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
{:else if name === 'receipt'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  </svg>
{:else if name === 'percent'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7h.01M17 17h.01" />
  </svg>
{:else if name === 'currency'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
{:else if name === 'wallet'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
{:else if name === 'cone'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 21h16M7 21l3.5-14.5a1.5 1.5 0 012.93 0L17 21M8.5 15h7M9.5 10.5h5" />
  </svg>
{:else if name === 'bus'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="16" rx="2" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 11h16M8 15h.01M16 15h.01M6 19v2M18 19v2" />
  </svg>
{:else if name === 'heart'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
{:else if name === 'eyedropper'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
{:else if name === 'minecart'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18l-2 10H5L3 6zm4 14a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
{:else if name === 'truck'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
{:else if name === 'bag'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
{:else if name === 'shop'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm1 14h16v4H4v-4z" />
  </svg>
{:else if name === 'egg'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <ellipse cx="12" cy="13" rx="8" ry="7" />
    <circle cx="12" cy="13" r="3" />
  </svg>
{:else if name === 'building'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
{:else if name === 'graduation'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
  </svg>
{:else if name === 'briefcase'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-4 5h16" />
  </svg>
{:else if name === 'rocket'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m0 0l4.242-4.242" />
  </svg>
{:else if name === 'code'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
{:else if name === 'phone'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <rect x="6" y="2" width="12" height="20" rx="3" />
    <circle cx="12" cy="18" r="1" />
  </svg>
{:else if name === 'compass'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
{:else if name === 'lifebuoy'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24m-14.14 0l4.24-4.24m5.66-5.66l4.24-4.24" />
  </svg>
{:else if name === 'trophy'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8m-4-4v4M5 4h14v4a7 7 0 01-14 0V4z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 6H2a2 2 0 002 2h1m14-2h3a2 2 0 01-2 2h-1" />
  </svg>
{:else if name === 'journal'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
{:else if name === 'question'}
  <svg class={className} fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
  </svg>
{:else}
  <!-- Default dot / chevron -->
  <svg class={className} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
{/if}
