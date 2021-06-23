import type { ClientEvents } from 'discord.js';

export interface Event {
  /**
   * The name of the event
   */
  name: keyof ClientEvents;

  /**
   * Whether or not the event listener should be unregistered after one use
   */
  once?: boolean;

  /**
   * The function to call when an event is recieved
   */
  execute(...args: Array<unknown>): Promise<void>;
}
