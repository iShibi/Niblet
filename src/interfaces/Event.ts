export interface Event {
  name: string;
  once?: boolean;
  execute(...args: Array<unknown>): void;
}
