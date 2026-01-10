<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let fullWidth: boolean = false;
  export let variant: 'primary' | 'default' = 'default';
</script>

<button
  {type}
  {disabled}
  class:full-width={fullWidth}
  class:primary={variant === 'primary'}
  on:click
>
  <slot />
</button>

<style>
  button {
    border: 1px solid transparent;
    outline: none;
    background-color: var(--surface-color);
    color: var(--text-main);
    padding: 12px 24px;
    border-radius: 9999px; /* Pill shape */
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  button:hover:not(:disabled) {
    background-color: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
    background-color: #e2e8f0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #e2e8f0;
    box-shadow: none;
  }

  .full-width {
    width: 100%;
  }

  /* Primary Variant */
  button.primary {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
  }

  button.primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
    border-color: var(--primary-hover);
    box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.5);
  }

  button.primary:active:not(:disabled) {
    background-color: var(--primary-hover);
    box-shadow: 0 2px 4px -1px rgba(99, 102, 241, 0.4);
  }
</style>
