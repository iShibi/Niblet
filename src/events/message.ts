'use strict';

import type { Message, Client, Collection, GuildChannel, GuildMember, PermissionResolvable } from 'discord.js';
import type { Command } from '../interfaces/Command';

import { PREFIX } from '../config.js';

export const event = (
  message: Message,
  client: Client,
  commands: Collection<string, Command>,
): Promise<Message> | void => {
  if (message.author.bot || !message.content.startsWith(PREFIX) || message.content.length <= PREFIX.length) return;

  const words: Array<string> = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName: string = words[0];
  const args: Array<string> = words.slice(1);

  const command: Command =
    commands.get(commandName) || (commands.find(cmd => cmd.aliases?.includes(commandName) as boolean) as Command);

  if (!command) {
    return message.channel.send('No such command exists!');
  }

  if (command.permissions) {
    const channel: GuildChannel = message.channel as GuildChannel;
    const authorPerms = channel.permissionsFor(message.member as GuildMember);
    if (!authorPerms || !authorPerms.has(command.permissions as Array<PermissionResolvable>)) {
      return;
    }
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${PREFIX}${commandName} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.log(error);
    message.channel.send('There was an error!');
  }
};
