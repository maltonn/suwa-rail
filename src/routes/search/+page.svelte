<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { searchRoutes, getCachedRoutes, type RouteResult } from '$lib/services/routeService';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';

  let fromStation = '';
  let toStation = '';
  let departureTime = '';
  let loading = true;
  let routes: RouteResult[] = [];

  // Subscribe to page store to react to URL changes
  $: {
    fromStation = $page.url.searchParams.get('from') || '';
    toStation = $page.url.searchParams.get('to') || '';
    departureTime = $page.url.searchParams.get('time') || '';
    
    if (fromStation && toStation) {
      loadRoutes();
    }
  }

  async function loadRoutes() {
    const cached = getCachedRoutes(fromStation, toStation, departureTime);
    if (cached) {
      routes = cached;
      loading = false;
      return;
    }

    loading = true;
    routes = await searchRoutes(fromStation, toStation, departureTime);
    loading = false;
  }

  function formatTime(timeStr: string) {
    return timeStr; // Already HH:MM
  }

  function getSummary(route: RouteResult) {
    const first = route.segments[0];
    const last = route.segments[route.segments.length - 1];
    return `${first.departureTime} → ${last.arrivalTime}`;
  }

  function navigateToDetail(id: string) {
    goto(`/search/${id}`);
  }
</script>

<div class="container">
  <div class="header">
    <Button on:click={() => goto('/')}>← 戻る</Button>
    <h2 class="route-title">{fromStation} <span class="arrow">→</span> {toStation}</h2>
  </div>

  <div class="legend">
    <span class="label">座れそう</span>
    <div class="color-bar"></div>
    <span class="label">無理そう</span>
  </div>

  <div class="results">
    {#if loading}
      <div class="loading">
        <p>経路を検索中...</p>
      </div>
    {:else}
      {#each routes as route}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="result-item" on:click={() => navigateToDetail(route.id)}>
            <Card interactive padding="24px">
              <div class="route-header">
                <span class="time">{getSummary(route)}</span>
                <span class="duration">{route.totalDuration}分</span>
              </div>
              
              <div class="route-meta">
                <!-- <span>¥{route.fare}</span>
                <span class="separator">•</span> -->
                <span>乗換 {route.transfers}回</span>
              </div>

              <div class="route-preview">
                {#each route.segments as segment, i}
                  <span class="station-node">{segment.fromStation}</span>
                  
                  <div class="line-container">
                    <span class="line-name-badge">{segment.line}</span>
                    <div class="congestion-line">
                      {#each segment.stops as stop}
                        {#if stop.nextSectionColor}
                          <div class="color-bit" style="background-color: {stop.nextSectionColor}" title="{stop.name}→"></div>
                        {/if}
                      {/each}
                    </div>
                  </div>

                  {#if i === route.segments.length - 1}
                    <span class="station-node">{segment.toStation}</span>
                  {/if}
                {/each}
              </div>
            </Card>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .header {
    margin-bottom: 2rem;
  }

  .route-title {
    margin-top: 1rem;
    font-size: 1.25rem;
    text-align: center;
    color: var(--text-main);
  }

  .arrow {
    color: var(--primary-color);
    padding: 0 0.5rem;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .loading {
    text-align: center;
    color: var(--text-sub);
    padding: 2rem;
  }

  .route-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;
  }

  .time {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .duration {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-sub);
  }

  .route-meta {
    font-size: 0.9rem;
    color: var(--text-sub);
    margin-bottom: 1.25rem;
  }

  .separator {
    margin: 0 0.5rem;
  }

  .route-preview {
    display: flex;
    align-items: center;
    width: 100%;
    overflow-x: hidden;
    padding: 0.5rem 0;
  }

  .station-node {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .line-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 8px;
    min-width: 60px;
  }

  .congestion-line {
    width: 100%;
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: var(--border-color);
  }

  .line-name-badge {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-sub);
    white-space: nowrap;
    margin-bottom: 2px;
    line-height: 1.2;
  }

  .color-bit {
    flex-grow: 1;
    height: 100%;
  }

  /* Legend */
  .legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-sub);
    margin-bottom: 1.5rem;
    justify-content: center;
  }

  .color-bar {
    width: 120px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, 
      #6366f1 0%, #6366f1 14.28%,
      #3b82f6 14.28%, #3b82f6 28.57%,
      #06b6d4 28.57%, #06b6d4 42.85%,
      #22c55e 42.85%, #22c55e 57.14%,
      #eab308 57.14%, #eab308 71.42%,
      #f97316 71.42%, #f97316 85.71%,
      #ef4444 85.71%, #ef4444 100%
    );
  }

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-sub);
  }
</style>
