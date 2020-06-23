import { useStore } from './useStore'
import { createStore } from './createStore'
import { State, StateCreator, StoreApi, UseStore } from './types'

export default function create<TState extends State>(
  createState: StateCreator<TState>
): [UseStore<TState>, StoreApi<TState>] {
  const store = createStore<TState>(createState);
  const storeHook = useStore<TState>(store);

  return [storeHook, store];
}

export * from './types'
export { create, useStore, createStore }
