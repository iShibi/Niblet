import type { Message } from 'discord.js';

export interface Command {
  name: string;
  execute(message: Message, args: Array<string>): Promise<void> | void;
}
