import type { Message, Collection, PermissionResolvable } from 'discord.js';

export interface Command {
  name: string;
  args?: boolean;
  usage?: string;
  permissions?: Array<PermissionResolvable>;
  aliases?: Array<string>;
  description: string;
  category: string;
  execute(
    message: Message,
    args: Array<string>,
    commands?: Collection<string, Command>,
  ): void | Promise<void | Message>;
}
