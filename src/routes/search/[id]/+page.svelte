<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { getRouteById, type RouteResult } from '$lib/services/routeService';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';

  let routeId = '';
  let route: RouteResult | undefined;
  let loading = true;

  // Subscribe to page store to handle ID changes
  $: {
    routeId = $page.params.id || '';
    if (routeId) {
      loadRoute();
    }
  }

  async function loadRoute() {
    loading = true;
    route = await getRouteById(routeId);
    loading = false;
  }
</script>

<div class="container">
  <div class="header">
    <Button on:click={() => history.back()}>← 戻る</Button>
    <h2 class="page-title">経路詳細</h2>
  </div>

  {#if loading}
    <div class="loading">読み込み中...</div>
  {:else if !route}
    <div class="error">経路が見つかりませんでした。</div>
  {:else}
    <div class="legend">
      <span class="label">座れそう</span>
      <div class="color-bar"></div>
      <span class="label">無理そう</span>
    </div>

    <div class="detail-card">
      <Card padding="30px">
        <div class="summary">
          <div class="total-time">{route.totalDuration}分</div>
          <!-- <div class="fare">¥{route.fare}</div> -->
        </div>

        <div class="timeline">
          {#each route.segments as segment, i}
            {#each segment.stops as stop, j}
              {@const isFirst = j === 0}
              {@const isLast = j === segment.stops.length - 1}
              {@const isMajor = isFirst || isLast}
              {@const isFinalDestination = i === route.segments.length - 1 && isLast}

              <!-- Station Point -->
              <div class="point station" class:minor={!isMajor}>
                <div class="time">{stop.time}</div>
                <div class="marker" 
                     class:major-marker={isMajor} 
                     class:end={isFinalDestination}
                     class:minor-marker={!isMajor}>
                </div>
                <div class="content">
                  <div class="station-name" class:major-text={isMajor}>{stop.name}</div>
                  {#if isFirst && i === 0}<div class="action">発</div>{/if}
                  {#if isLast}<div class="action">{isFinalDestination ? '着' : '乗換'}</div>{/if}
                </div>
              </div>

              <!-- Path to next station in this segment -->
              {#if !isLast}
                <div class="line-segment">
                  <div class="line-bar" style="background-color: {stop.nextSectionColor || 'var(--border-color)'}"></div>
                  {#if isFirst}
                    <div class="line-info">
                      <span class="line-name">{segment.line}</span>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}

            <!-- Path to next segment (Transfer) -->
            {#if i < route.segments.length - 1}
              <div class="line-segment transfer-segment">
                <div class="line-bar dashed"></div>
                <div class="line-info transfer-info">
                  <span class="transfer-icon">↓</span>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </Card>
    </div>
  {/if}
</div>

<style>
  .header {
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .page-title {
    margin: 0;
    font-size: 1.25rem;
  }

  .loading, .error {
    text-align: center;
    color: var(--text-sub);
    margin-top: 2rem;
  }

  .summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .total-time {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .fare {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
  }

  /* Timeline Styles */
  .timeline {
    position: relative;
    padding-left: 10px;
  }

  .point {
    display: flex;
    align-items: flex-start; /* Changed to flex-start for alignment */
    position: relative;
    z-index: 1;
    min-height: 32px; /* Minimum height for stations */
  }
  
  .point.minor {
    min-height: 24px;
    opacity: 0.8;
  }

  .time {
    width: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-sub);
    text-align: right;
    margin-right: 15px;
    line-height: 1.2;
    padding-top: 2px;
  }

  /* Markers */
  .marker {
    flex-shrink: 0;
    margin-right: 15px;
    background-color: var(--surface-color);
    border: 3px solid var(--primary-color);
    box-shadow: 0 0 0 2px var(--surface-color);
    z-index: 2;
  }

  .major-marker {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-top: 2px;
  }

  .minor-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border-width: 2px;
    margin-top: 5px;
    margin-left: 3px; /* Align center with major marker (14px width vs 8px width + 3px*2 ? no. 14/2=7, 8/2=4. Center diff 3px) */
    border-color: var(--text-sub);
  }

  .marker.end {
    background-color: var(--primary-color);
  }

  .content {
    padding-bottom: 2px;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .station-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-main);
  }

  .station-name.major-text {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .action {
    font-size: 0.75rem;
    color: var(--text-sub);
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  /* Lines */
  .line-segment {
    display: flex;
    min-height: 40px; /* Shortened default height */
    position: relative;
  }

  .line-bar {
    width: 4px;
    background-color: var(--border-color);
    margin-left: 74px; /* Align with marker center */
    transform: translateX(-50%);
    position: absolute;
    top: -4px; /* Pull up to connect with marker */
    bottom: -4px; /* Pull down to connect */
    z-index: 0;
  }
  
  .point.minor + .line-segment .line-bar {
    top: -6px; /* Adjust for smaller marker */
  }

  .line-bar.dashed {
    background-color: transparent;
    border-left: 2px dashed var(--text-sub);
    width: 0;
    opacity: 0.3;
  }

  .line-info {
    padding-left: 90px; /* Right of the line */
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    align-items: center;
  }

  .line-name {
    background-color: var(--surface-color);
    border: 1px solid var(--border-color);
    padding: 4px 12px;
    border-radius: 99px;
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-main);
    box-shadow: var(--shadow-sm);
  }

  .transfer-segment {
    min-height: 30px;
  }
  
  .transfer-icon {
    font-size: 0.8rem;
    color: var(--text-sub);
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
