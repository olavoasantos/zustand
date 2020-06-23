import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { State, StoreApi, StateListener, StateSelector, EqualityChecker, Subscriber } from './types'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

const useStore = <TState extends State>(store: StoreApi<TState>) => <StateSlice>(
  selector: StateSelector<TState, StateSlice> = store.getState.bind(store),
  equalityFn: EqualityChecker<StateSlice> = Object.is
): StateSlice => {
  const forceUpdate: StateListener<StateSlice> = useReducer(c => c + 1, 0)[1]
  const subscriberRef = useRef<Subscriber<TState, StateSlice>>()

  if (!subscriberRef.current) {
    subscriberRef.current = store.createListener<StateSlice>(forceUpdate, selector, equalityFn)
    subscriberRef.current.unsubscribe = store.listen<StateSlice>(subscriberRef.current)
  }

  const subscriber = subscriberRef.current
  let newStateSlice: StateSlice | undefined
  let hasNewStateSlice = false

  // The selector or equalityFn need to be called during the render phase if
  // they change. We also want legitimate errors to be visible so we re-run
  // them if they errored in the subscriber.
  if (
    subscriber.selector !== selector ||
    subscriber.equalityFn !== equalityFn ||
    subscriber.errored
  ) {
    // Using local variables to avoid mutations in the render phase.
    newStateSlice = selector(store.getState())
    hasNewStateSlice = !equalityFn(subscriber.currentSlice, newStateSlice)
  }

  // Syncing changes in useEffect.
  useIsoLayoutEffect(() => {
    if (hasNewStateSlice) {
      subscriber.currentSlice = newStateSlice as StateSlice
    }
    subscriber.selector = selector
    subscriber.equalityFn = equalityFn
    subscriber.errored = false
  })

  useIsoLayoutEffect(() => subscriber.unsubscribe, [])

  return hasNewStateSlice
    ? (newStateSlice as StateSlice)
    : subscriber.currentSlice
}

export { useStore }
