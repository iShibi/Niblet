import type { Message, Client, Collection } from 'discord.js';
import type { Command } from '../interfaces/Command';

// this is just a hack, would remove this later
import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { PREFIX } = _require('../config.json');

export const event = (message: Message, client: Client, commands: Collection<string, Command>): void => {
  if (message.author.bot || !message.content.startsWith(PREFIX) || message.content.length <= PREFIX.length) return;

  const words: Array<string> = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command: string = words[0];
  const args: Array<string> = words.slice(1);

  if (!commands.has(command)) {
    message.channel.send('No such command exists!');
    return;
  }

  try {
    commands.get(command)?.execute(message, args);
  } catch (error) {
    console.log(error);
    message.channel.send('There was an error!');
  }
};
