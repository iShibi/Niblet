import type { Message, Client, Collection } from 'discord.js';
import type { Command } from '../index';
const prefix = '?';

export const event = (message: Message, client: Client, commands: Collection<string | null, Command>): void => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args: Array<string> = message.content.slice(prefix.length).trim().split(/ +/);
  const command: string | null = args.shift()?.toLocaleLowerCase() ?? null;

  if (!commands.has(command)) return;

  try {
    commands.get(command)?.execute(message, args);
  } catch (error) {
    console.log(error);
    message.channel.send('There was an error!');
  }
};
