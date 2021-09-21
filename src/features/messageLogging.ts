import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';
import type { GuildDocument } from '../typings';

export async function logEditedMessage(oldMessage: Message, newMessage: Message): Promise<unknown> {
  const guild = oldMessage.guild ?? newMessage.guild;
  if (!guild) return;
  const guildDoc = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });
  if (!guildDoc) return;
  const messageLogsChannelId = guildDoc.messageLogsChannelId;
  if (!messageLogsChannelId) return;

  if (oldMessage.channel.id === messageLogsChannelId) return;

  const channel = guild.channels.cache.find(channel => channel.id === messageLogsChannelId);
  if (!channel || !channel.isText()) return;

  const logEmbed = new MessageEmbed()
    .setColor('PURPLE')
    .setAuthor(`${oldMessage.author.tag} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
    .setDescription(
      `**Message Edited by ${oldMessage.author} in ${oldMessage.channel}:**\n\n**Before:** ${oldMessage.content}\n**After:** ${newMessage.content}`,
    )
    .setTimestamp();

  return channel.send({ embeds: [logEmbed] });
}

export async function logDeletedMessage(message: Message): Promise<unknown> {
  const guild = message.guild;
  if (!guild) return;
  const guildDoc = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });
  if (!guildDoc) return;
  const messageLogsChannelId = guildDoc.messageLogsChannelId;
  if (!messageLogsChannelId) return;

  if (message.channel.id === messageLogsChannelId) return;

  const channel = guild.channels.cache.find(channel => channel.id === messageLogsChannelId);
  if (!channel || !channel.isText()) return;

  const logEmbed = new MessageEmbed()
    .setColor('RED')
    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
    .setDescription(`**Message deleted by ${message.author} in ${message.channel}:**\n\n${message.content}`)
    .setTimestamp();

  channel.send({ embeds: [logEmbed] });
}
