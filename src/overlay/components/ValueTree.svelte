<script lang="ts">
  import ValueTree from './ValueTree.svelte'

  const SDT_UNDEFINED = '__sdt_undefined__'

  interface Props {
    value: unknown
    depth?: number
    label?: string
  }

  interface PreviewItem {
    key?: string
    value: string
  }

  let { value, depth = 0, label }: Props = $props()

  const isBranch = $derived(value !== null && typeof value === 'object')
  const entries = $derived(isBranch ? Object.entries(value) : [])
  const previewItems = $derived(preview(value))
  const previewOverflow = $derived(entries.length > 3)
  // svelte-ignore state_referenced_locally
  let expanded = $state(depth <= 5)

  function display(value: unknown): string {
    if (value === SDT_UNDEFINED || value === undefined) return 'undefined'
    const json = JSON.stringify(value)
    return json ?? String(value)
  }

  function preview(value: unknown): PreviewItem[] {
    if (value === null || typeof value !== 'object') return [{ value: display(value) }]
    const items = Array.isArray(value)
      ? value.map((item) => ({ value: previewValue(item) }))
      : Object.entries(value).map(([key, item]) => ({ key, value: previewValue(item) }))
    return items.slice(0, 3)
  }

  function previewValue(value: unknown): string {
    if (value !== null && typeof value === 'object') return Array.isArray(value) ? '[\u2026]' : '{\u2026}'
    return display(value)
  }
</script>

<div class="node">
  {#if isBranch}
    <button class="branch" onclick={() => expanded = !expanded} aria-expanded={expanded}>
      <span class="chevron" class:expanded aria-hidden="true"></span>
      {#if label}<span class="key">{label}: </span>{/if}
      {#if !expanded}
        <span class="preview">
          <span class="bracket">{Array.isArray(value) ? '[' : '{'}</span>
          <span class="preview-content">
            {#each previewItems as item, index (item.key ?? index)}
              {#if index > 0}, {/if}
              {#if item.key}<span class="preview-key">{item.key}</span>: {/if}
              <span class="preview-value">{item.value}</span>
            {/each}
            {#if previewOverflow}, &#8230;{/if}
          </span>
          <span class="bracket">{Array.isArray(value) ? ']' : '}'}</span>
        </span>
      {/if}
    </button>
    {#if expanded}
      <div class="children">
        {#each entries as [key, item] (key)}
          <ValueTree value={item} label={Array.isArray(value) ? `[${key}]` : key} depth={depth + 1} />
        {/each}
      </div>
    {/if}
  {:else}
    {#if label}<span class="key">{label}: </span>{/if}
    <span class:undefined={value === SDT_UNDEFINED || value === undefined} class="primitive">{display(value)}</span>
  {/if}
</div>

<style>
  .node { min-width: 0; line-height: 1.35; }
  .branch {
    display: flex;
    align-items: center;
    gap: 3px;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border: 0;
    padding: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
  }
  .branch:hover { color: #ff9d6c; }
  .chevron {
    width: 6px;
    height: 6px;
    flex: 0 0 auto;
    border-top: 1px solid #7ecfff;
    border-right: 1px solid #7ecfff;
    transform: rotate(45deg);
    transition: transform 0.1s;
  }
  .chevron.expanded { transform: rotate(135deg); }
  .children { margin-left: 8px; padding-left: 7px; border-left: 1px solid rgba(255,255,255,0.12); }
  .key, .preview-key { color: #7ecfff; white-space: nowrap; }
  .preview { display: flex; flex: 0 1 auto; min-width: 0; }
  .preview-content { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bracket { flex: 0 0 auto; }
  .preview-value { color: #d8f7d0; }
  .primitive { overflow-wrap: anywhere; }
  .undefined { opacity: 0.55; }
</style>
