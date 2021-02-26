'use strict';

import type { Message, TextChannel } from 'discord.js';
import { MESSAGE_LOGS_CHANNEL_ID } from '../config.js';
import { MessageEmbed } from 'discord.js';

export function logEditedMessage(oldMessage: Message, newMessage: Message): void {
  if (oldMessage.channel.id === MESSAGE_LOGS_CHANNEL_ID) return;

  const channel = oldMessage.guild?.channels.cache.find(
    channel => channel.id === MESSAGE_LOGS_CHANNEL_ID,
  ) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('PURPLE')
    .setAuthor(`${oldMessage.author.tag} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
    .setDescription(
      `**Message Edited by ${oldMessage.author} in ${oldMessage.channel}:**\n\n**Before**: ${oldMessage.content}\n**After**: ${newMessage.content}`,
    );

  channel.send(logEmbed);
}
