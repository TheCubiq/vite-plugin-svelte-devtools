<script lang="ts">
  import ComponentTree from './ComponentTree.svelte'
  import ComponentDetail from './ComponentDetail.svelte'

  // Resizable split: left pane width as a percentage
  let splitPct = $state(40)
  let treeCollapsed = $state(false)
  let dragging = $state(false)
  let containerEl = $state<HTMLDivElement | undefined>(undefined)

  function onDividerMousedown(e: MouseEvent) {
    e.preventDefault()
    dragging = true
    const startX = e.clientX
    const startPct = splitPct

    function onMove(ev: MouseEvent) {
      if (!containerEl) return
      const w = containerEl.getBoundingClientRect().width
      const delta = ((ev.clientX - startX) / w) * 100
      const nextPct = Math.min(70, Math.max(0, startPct + delta))
      treeCollapsed = nextPct < 1
      splitPct = treeCollapsed ? 0 : nextPct
    }
    function onUp() {
      dragging = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function expandTree() {
    treeCollapsed = false
    splitPct = 40
  }
</script>

<div class="inspector" bind:this={containerEl} class:dragging>
  <!-- Left: Component tree -->
  <div class="pane pane-left" class:collapsed={treeCollapsed} style="width: {splitPct}%">
    <ComponentTree />
  </div>

  <!-- Drag handle -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
  <div
    class="divider"
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    onmousedown={onDividerMousedown}
  ></div>

  {#if treeCollapsed}
    <button class="tree-expand" onclick={expandTree} aria-label="Show component tree"><span class="expand-chevron" aria-hidden="true"></span></button>
  {/if}

  <!-- Right: Detail -->
  <div class="pane pane-right">
    <div class="detail-scroll">
      <ComponentDetail />
    </div>
  </div>
</div>

<style>
  .inspector {
    display: flex;
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .inspector.dragging { cursor: col-resize; user-select: none; }

  .pane { height: 100%; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
  .pane-left { border-right: 1px solid rgba(255,255,255,0.08); }
  .pane-left.collapsed { border-right: 0; }
  .pane-right { flex: 1; min-width: 0; }

  .divider {
    width: 5px;
    cursor: col-resize;
    flex-shrink: 0;
    background: transparent;
    transition: background 0.15s;
  }
  .divider:hover, .dragging .divider { background: rgba(99,179,237,0.3); }
  .tree-expand {
    position: absolute;
    top: 5px;
    left: 6px;
    z-index: 1;
    border: 0;
    border-radius: 3px;
    background: #132033;
    color: #a8dfff;
    cursor: pointer;
    padding: 2px 5px;
    line-height: 1;
  }
  .tree-expand:hover { background: #1d304b; }
  .expand-chevron {
    display: block;
    width: 7px;
    height: 7px;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    transform: rotate(45deg);
  }

  .detail-scroll {
    height: 100%;
    overflow-y: auto;
  }
</style>
