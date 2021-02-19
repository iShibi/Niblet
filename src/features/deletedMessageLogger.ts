'use strict';

import type { Message, TextChannel } from 'discord.js';
import { DELETED_MESSAGE_LOG_CHANNEL_ID } from '../config.js';
import { MessageEmbed } from 'discord.js';

export function logDeletedMessage(message: Message): void {
  if (message.channel.id === DELETED_MESSAGE_LOG_CHANNEL_ID) return;

  const channel = message.guild?.channels.cache.find(
    channel => channel.id === DELETED_MESSAGE_LOG_CHANNEL_ID,
  ) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('RED')
    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
    .setDescription(`${message.author}: ${message.content}`);

  channel.send(logEmbed);
}
