/**
 * open-in-editor middleware tests
 *
 * These tests exercise the `openInEditorHandler` exported from the plugin.
 * The handler accepts an optional `_launch` parameter for dependency
 * injection, so we pass a vi.fn() spy directly — no module mocking needed.
 *
 * Key assertion: the handler must append `:1:1` to the raw `file` query
 * parameter before handing it to `launchEditor` so that the editor raises
 * its window and focuses line 1 (launch-editor parses `:line:col` via its
 * internal positionRE).
 *
 * Coverage:
 *   ✓ valid file param → launchEditor called with `<file>:1:1`
 *   ✓ missing file param → 400 response, launchEditor NOT called
 *   ✓ empty file param → 400, launchEditor NOT called
 *   ✓ response is 200 + "ok" on success
 *   ✓ second arg to launchEditor is undefined (default editor detection)
 *   ✓ third arg is an error callback function
 *   ✓ error callback logs a console.warn without throwing
 *   ✓ appends :1:1 to a Windows-style absolute path
 *   ✓ appends :1:1 to any POSIX path
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { openInEditorHandler } from '../src/plugin/index'

// ── helpers ──────────────────────────────────────────────────────────────────

function mockReq(url: string) {
  return { url }
}

function mockRes() {
  return {
    statusCode: 0 as number,
    body: '' as string,
    end(b: string) { this.body = b },
  }
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('openInEditorHandler (/__open-in-editor middleware)', () => {
  let launch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    launch = vi.fn()
  })

  it('calls launchEditor with file:1:1 when file param is present', () => {
    const req = mockReq('/?file=/src/lib/Counter.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(launch).toHaveBeenCalledOnce()
    expect(launch.mock.calls[0][0]).toBe('/src/lib/Counter.svelte:1:1')
  })

  it('responds with 200 and "ok" on success', () => {
    const req = mockReq('/?file=/src/App.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe('ok')
  })

  it('responds with 400 and does NOT call launchEditor when file param is missing', () => {
    const req = mockReq('/')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(res.statusCode).toBe(400)
    expect(launch).not.toHaveBeenCalled()
  })

  it('responds with 400 when file param is empty string', () => {
    const req = mockReq('/?file=')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(res.statusCode).toBe(400)
    expect(launch).not.toHaveBeenCalled()
  })

  it('passes undefined as second arg to launchEditor', () => {
    const req = mockReq('/?file=/src/App.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(launch.mock.calls[0][1]).toBeUndefined()
  })

  it('passes an error callback as third arg to launchEditor', () => {
    const req = mockReq('/?file=/src/App.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(typeof launch.mock.calls[0][2]).toBe('function')
  })

  it('error callback logs a console.warn without throwing', () => {
    const req = mockReq('/?file=/src/App.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    const errorCb = launch.mock.calls[0][2] as (f: string, e: string) => void
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => errorCb('/src/App.svelte', 'editor not found')).not.toThrow()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Could not open'))
    warn.mockRestore()
  })

  it('appends :1:1 to a Windows-style absolute path (URL-encoded)', () => {
    // URL-encoded C:\Users\foo\src\App.svelte
    const req = mockReq('/?file=C%3A%5CUsers%5Cfoo%5Csrc%5CApp.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(launch.mock.calls[0][0]).toBe('C:\\Users\\foo\\src\\App.svelte:1:1')
  })

  it('appends :1:1 to a POSIX absolute path', () => {
    const req = mockReq('/?file=/src/Foo.svelte')
    const res = mockRes()
    openInEditorHandler(req, res, launch as any)
    expect(launch.mock.calls[0][0]).toMatch(/^\/src\/Foo\.svelte:1:1$/)
  })
})
