'use strict';

import type { Message, TextChannel } from 'discord.js';
import { MESSAGE_LOGS_CHANNEL_ID } from '../config.js';
import { MessageEmbed } from 'discord.js';

export function logDeletedMessage(message: Message): void {
  if (message.channel.id === MESSAGE_LOGS_CHANNEL_ID) return;

  const channel = message.guild?.channels.cache.find(channel => channel.id === MESSAGE_LOGS_CHANNEL_ID) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('RED')
    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
    .setDescription(`**Message deleted by ${message.author} in ${message.channel}**:\n\n${message.content}`);

  channel.send(logEmbed);
}
