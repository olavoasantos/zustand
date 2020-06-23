import { State, StateCreator, StoreApi, SetState, GetState, StateListener, StateSelector, EqualityChecker, Subscriber, Subscribe, ApiSubscribe, Destroy } from './types'

function createStore<TState extends State>(
  createState: StateCreator<TState>
): StoreApi<TState> {
  let state: TState
  let listeners: Set<() => void> = new Set()

  const setState: SetState<TState> = partial => {
    const partialState =
      typeof partial === 'function' ? partial(state) : partial
    if (partialState !== state) {
      state = Object.assign({}, state, partialState)
      listeners.forEach(listener => listener())
    }
  }

  const getState: GetState<TState> = () => state

  const createListener = <StateSlice>(
    listener: StateListener<StateSlice>,
    selector: StateSelector<TState, StateSlice> = getState,
    equalityFn: EqualityChecker<StateSlice> = Object.is
  ): Subscriber<TState, StateSlice> => ({
    currentSlice: selector(state),
    equalityFn,
    errored: false,
    listener,
    selector,
    unsubscribe: () => { },
  })

  const listen: Subscribe<TState> = <StateSlice>(
    subscriber: Subscriber<TState, StateSlice>
  ) => {
    function listener() {
      // Selector or equality function could throw but we don't want to stop
      // the listener from being called.
      // https://github.com/react-spring/zustand/pull/37
      try {
        const newStateSlice = subscriber.selector(state)
        if (!subscriber.equalityFn(subscriber.currentSlice, newStateSlice)) {
          subscriber.listener((subscriber.currentSlice = newStateSlice))
        }
      } catch (error) {
        subscriber.errored = true
        subscriber.listener(null, error)
      }
    }

    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const subscribe: ApiSubscribe<TState> = <StateSlice>(
    listener: StateListener<StateSlice>,
    selector?: StateSelector<TState, StateSlice>,
    equalityFn?: EqualityChecker<StateSlice>
  ) => listen(createListener(listener, selector, equalityFn))

  const destroy: Destroy = () => listeners.clear()

  const api = { setState, getState, subscribe, listen, createListener, destroy }
  state = createState(setState, getState, api)

  return api;
}

export { createStore }
