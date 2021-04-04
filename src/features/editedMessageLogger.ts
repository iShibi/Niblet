import { guildsInfo } from '../index.js';
import { MessageEmbed } from 'discord.js';
import type { Message, TextChannel } from 'discord.js';

export function logEditedMessage(oldMessage: Message, newMessage: Message): void {
  const messageLogsChannelId = guildsInfo.get(oldMessage.guild?.id as string)?.messageLogsChannelId ?? null;
  if (oldMessage.channel.id === messageLogsChannelId) return;

  const channel = oldMessage.guild?.channels.cache.find(channel => channel.id === messageLogsChannelId) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('PURPLE')
    .setAuthor(`${oldMessage.author.tag} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
    .setDescription(
      `**Message Edited by ${oldMessage.author} in ${oldMessage.channel}:**\n\n**Before**: ${oldMessage.content}\n**After**: ${newMessage.content}`,
    );

  channel.send(logEmbed);
}
