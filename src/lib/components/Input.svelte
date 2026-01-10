<script lang="ts">
  export let value: string;
  export let placeholder: string = '';
  export let label: string = '';
  export let type: string = 'text';
  export let id: string = Math.random().toString(36).substr(2, 9);

  function handleInput(e: Event) {
    value = (e.currentTarget as HTMLInputElement).value;
  }
</script>

<div class="input-group">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <input
    {id}
    {type}
    {placeholder}
    {value}
    on:input={handleInput}
    on:change
  />
</div>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-main);
    margin-left: 4px;
  }

  input {
    border: 1px solid var(--border-color);
    outline: none;
    background-color: var(--surface-color);
    color: var(--text-main);
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  ::placeholder {
    color: var(--text-sub);
    opacity: 0.7;
  }
</style>
