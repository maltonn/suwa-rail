<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Card from '$lib/components/Card.svelte';

  let fromStation = '';
  let toStation = '';
  let departureTime = '';

  // Set default time to current time
  const now = new Date();
  departureTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const handleSearch = () => {
    if (!fromStation || !toStation) return;
    
    const params = new URLSearchParams({
      from: fromStation,
      to: toStation,
      time: departureTime
    });
    
    goto(`/search?${params.toString()}`);
  };
</script>

<div class="container flex-center">
  <div class="search-wrapper">
    <h1 >すわれ～る(beta)</h1>
    <p>「座れるかどうか」をポイントに置いた乗り換え案内 <br/> 現在はJR東日本と東京メトロのみ対応</p>
    <Card padding="20px">
      <h1 class="title">経路検索</h1>
      <div class="form-group">
        <Input 
          label="出発駅" 
          placeholder="駅名を入力" 
          bind:value={fromStation} 
        />
        
        <div class="icon-wrapper">
          <span class="material-icons">↓</span>
        </div>

        <Input 
          label="到着駅" 
          placeholder="駅名を入力" 
          bind:value={toStation} 
        />
        
        <Input 
          type="time" 
          label="出発時刻" 
          bind:value={departureTime} 
        />

        <div class="mt-4">
          <Button 
            fullWidth 
            variant="primary" 
            disabled={!fromStation || !toStation}
            on:click={handleSearch}
          >
            検索
          </Button>
        </div>
      </div>
    </Card>
  </div>
</div>

<style>
  .search-wrapper {
    width: 100%;
    max-width: 400px;
  }

  .title {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--text-main);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1.0rem;
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--text-sub);
    margin: -0.5rem auto; /* Overlap slightly to connect inputs visually */
    background-color: var(--bg-color);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    border: 1px solid var(--border-color);
  }
</style>
