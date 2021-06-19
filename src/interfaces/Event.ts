export interface Event {
  /**
   * The name of the event
   */
  name: string;

  /**
   * Whether or not the event listener should be unregistered after one use
   */
  once?: boolean;

  /**
   * The function to call when an event is recieved
   */
  execute(...args: Array<unknown>): Promise<void>;
}
