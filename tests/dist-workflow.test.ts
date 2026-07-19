import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('dist workflow', () => {
  it('publishes the same package layout as npm', async () => {
    const workflow = await readFile('.github/workflows/dist.yml', 'utf8')

    expect(workflow).toContain('mkdir .release\n          npm pack --pack-destination .release')
    expect(workflow).toContain('tar -xzf .release/*.tgz -C release --strip-components=1')
    expect(workflow).toContain('publish_dir: ./release')
  })
})
