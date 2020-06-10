/** A function that responds to a signal changing. */
type Handler<T> = (value: T, oldValue?: T) => void;

/**
 * A function that unregisters a @see {Handler}.
 *
 * @returns `true` if that handler was registered, `false` otherwise.
 */
type Cleanup = () => boolean;

/**
 * A data signal, an object which notifies subscribers when data is modified.
 */
export class DataSignal<T> {
  private readonly _handlers: Set<Handler<T>> = new Set();
  private _value: T;

  public constructor(value: T) {
    this._value = value;
  }

  public getValue(): T {
    return this._value;
  }

  public setValue(value: T) {
    const oldValue = this._value;
    this._value = value;

    for (const handler of this._handlers) {
      handler(value, oldValue);
    }
  }

  /**
   * Registers a handler for this signal.
   *
   * @param handler The handler which will respond to future value changes on
   * this signal.
   * @returns A cleanup function which will unregister this handler when called.
   */
  public addHandler(handler: Handler<T>): Cleanup {
    this._handlers.add(handler);

    return () => this.removeHandler(handler);
  }

  /**
   * Unregisters a handler for this signal.
   *
   * @param handler The handler which should not respond to future value changes
   * on this signal.
   * @returns `true` if that handler was registered, `false` otherwise.
   */
  public removeHandler(handler: Handler<T>): boolean {
    return this._handlers.delete(handler);
  }
}
