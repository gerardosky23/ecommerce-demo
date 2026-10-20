<script lang="ts">
  interface FaqItem {
    question: string;
    answer: string;
  }

  let { items = [] }: { items: FaqItem[] } = $props();

  let openIndex = $state<number | null>(0);

  function toggle(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<div class="space-y-3 max-w-3xl mx-auto">
  {#each items as item, index}
    {@const isOpen = openIndex === index}
    <div class="rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-200 {isOpen ? 'border-neutral-400 shadow-sm' : 'hover:border-neutral-300'}">
      <button
        type="button"
        class="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-normal text-sm sm:text-base text-brand-dark focus:outline-none"
        onclick={() => toggle(index)}
        aria-expanded={isOpen}
      >
        <span class="font-medium">{item.question}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5 flex-shrink-0 text-brand-muted transition-transform duration-200 {isOpen ? 'rotate-180 text-brand-magenta' : ''}"
          aria-hidden="true"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      {#if isOpen}
        <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-brand-muted leading-relaxed border-t border-neutral-100 font-light">
          <p>{item.answer}</p>
        </div>
      {/if}
    </div>
  {/each}
</div>
