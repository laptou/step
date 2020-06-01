export type Thunk<T> = T | (() => T);
export type Arrunk<T> = T | T[]; // array thunk

declare module '@res/img/*' {
  const path: string;
  export default path;
}

declare module '@res/icon/*' {
  const path: string;
  export default path;
}

declare module '@res/text/*' {
  const markdown: { attributes: Record<string, any>; html: string; };
  export default markdown;
}
