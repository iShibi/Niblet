import { guildsInfo } from '../index.js';
import { MessageEmbed } from 'discord.js';
import type { Message, TextChannel } from 'discord.js';

export function logDeletedMessage(message: Message): void {
  const messageLogsChannelId = guildsInfo.get(message.guild?.id as string)?.messageLogsChannelId ?? null;
  if (message.channel.id === messageLogsChannelId) return;

  const channel = message.guild?.channels.cache.find(channel => channel.id === messageLogsChannelId) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('RED')
    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
    .setDescription(`**Message deleted by ${message.author} in ${message.channel}**:\n\n${message.content}`);

  channel.send(logEmbed);
}
