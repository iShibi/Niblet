import type { Message } from 'discord.js';

export interface Command {
  name: string;
  args: boolean;
  usage: string;
  permissions: Array<string>;
  execute(message: Message, args: Array<string>): void | Promise<void | Message>;
}
