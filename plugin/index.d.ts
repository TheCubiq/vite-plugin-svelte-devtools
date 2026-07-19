import type { PreprocessorGroup } from 'svelte/compiler'
import type { PluginOption } from 'vite'

export function svelteDevTools(options?: { devOnly?: boolean }): {
  preprocess: PreprocessorGroup[]
  plugin: PluginOption
}
