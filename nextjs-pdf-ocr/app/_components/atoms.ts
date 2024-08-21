
import { atom, createStore } from "jotai";
import { atomFamily, atomWithStorage } from 'jotai/utils'
import type { WasmDiagnosticError, WasmError, WasmProject, WasmRuntime } from '@gloo-ai/baml-schema-wasm-web'
export const atomStore = createStore()

export const filesAtom = atom<Record<string, string>>({})

export const projectAtom = atom<WasmProject | null>(null)
export const runtimesAtom = atom<{
  last_successful_runtime?: WasmRuntime
  current_runtime?: WasmRuntime
  diagnostics?: WasmDiagnosticError
}>({})

export const diagnosticsAtom = atom<WasmError[]>([])

export const selectedFunctionStorageAtom = atom<string | null>(null)
// const envKeyValueStorage = atomWithStorage<[string, string][]>(
//   'env-key-values',
//   defaultEnvKeyValues,
//   vscodeLocalStorageStore,
// )
