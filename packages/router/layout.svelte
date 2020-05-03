<script>
  export let layouts = [];
	
	$: [first, ...rest] = layouts;
</script>


<svelte:component this={first.default}>
  {#if rest.length} 
    <svelte:self layouts={rest}>
      <slot></slot>
    </svelte:self>
  {:else}
    <slot></slot>
  {/if}
</svelte:component>

