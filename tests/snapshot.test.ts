import { describe, expect, it } from 'vitest'
import { cloneSnapshotValue } from '../src/runtime/snapshot'

describe('cloneSnapshotValue', () => {
  it('keeps values deeper than five levels', () => {
    const value = { a: { b: { c: { d: { e: { f: 1 } } } } } }

    expect(cloneSnapshotValue(value)).toEqual(value)
  })

  it('marks circular references', () => {
    const value: { self?: unknown } = {}
    value.self = value

    expect(cloneSnapshotValue(value)).toEqual({ self: '[circular]' })
  })
})
