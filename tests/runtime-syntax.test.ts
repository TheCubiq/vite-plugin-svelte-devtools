import { readFile } from 'node:fs/promises'
import { transformWithEsbuild } from 'vite'
import { describe, expect, it } from 'vitest'

describe('runtime source', () => {
  it('parses when Vite serves the virtual runtime module', async () => {
    const source = await readFile('src/runtime/index.ts', 'utf8')

    await expect(transformWithEsbuild(source, 'src/runtime/index.ts', { loader: 'ts' })).resolves.toBeDefined()
  })
})
