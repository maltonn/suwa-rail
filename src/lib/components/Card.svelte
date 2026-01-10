<script lang="ts">
  export let interactive: boolean = false;
  export let padding: string = '20px';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="card" 
  class:interactive 
  style="padding: {padding};"
  on:click
>
  <slot />
</div>

<style>
  .card {
    background-color: var(--surface-color);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    
    /* Modern Shadow */
    box-shadow: var(--shadow-sm);
    
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .interactive {
    cursor: pointer;
  }

  .interactive:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }

  .interactive:active {
    transform: translateY(0);
    box-shadow: var(--shadow-md);
  }
</style>
