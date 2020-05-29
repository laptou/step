export type Thunk<T> = T | (() => T);
export type Arrunk<T> = T | T[]; // array thunk
