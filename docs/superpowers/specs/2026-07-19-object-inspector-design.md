# Object Inspector Design

## Goal

Show complete inspectable object snapshots without the runtime's fixed depth cutoff.

## Design

The runtime will clone nested values cycle-safely instead of replacing them at depth five. Circular references become a marker so snapshotting stays safe. The inspector will render objects and arrays as a nested tree. Levels zero through five start open; deeper levels start closed and can be expanded individually.

Primitive values stay inline. Copy and edit actions remain on the root prop/state row, so existing behavior does not move.

## Scope

Modify runtime snapshot cloning and the inspector's value renderer. Add focused tests for deep values and circular references. No dependency, protocol, or store-inspector change.

## Checks

Run focused Vitest tests, Svelte autofixer, package tests, and package build.
