export type State = Record<string | number | symbol, any>
export type PartialState<T extends State> =
  | Partial<T>
  | ((state: T) => Partial<T>)
export type StateCreator<T extends State> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T
export type StateSelector<T extends State, U> = (state: T) => U
export type StateListener<T> = (state: T | null, error?: Error) => void
export type SetState<T extends State> = (partial: PartialState<T>) => void
export type GetState<T extends State> = () => T
export type CreateListener<T extends State> = <U>(
  listener: StateListener<U>,
  selector: StateSelector<T, U>,
  equalityFn: EqualityChecker<U>
) => Subscriber<T, U>
export interface Subscriber<T extends State, U> {
  currentSlice: U
  equalityFn: EqualityChecker<U>
  errored: boolean
  listener: StateListener<U>
  selector: StateSelector<T, U>
  unsubscribe: () => void
}
export type Subscribe<T extends State> = <U>(
  subscriber: Subscriber<T, U>
) => () => void
export type ApiSubscribe<T extends State> = <U>(
  listener: StateListener<U>,
  selector?: StateSelector<T, U>,
  equalityFn?: EqualityChecker<U>
) => () => void
export type EqualityChecker<T> = (state: T, newState: any) => boolean
export type Destroy = () => void
export interface UseStore<T extends State> {
  (): T
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): U
}
export interface StoreApi<T extends State> {
  setState: SetState<T>
  getState: GetState<T>
  subscribe: ApiSubscribe<T>
  destroy: Destroy
  createListener: CreateListener<T>;
  listen: Subscribe<T>;
}
