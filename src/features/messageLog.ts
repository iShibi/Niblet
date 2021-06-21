import { MessageEmbed } from 'discord.js';
import { getGuildDoc } from '../utils/Utility.js';
import type { Message, TextChannel } from 'discord.js';

export async function logEditedMessage(oldMessage: Message, newMessage: Message): Promise<unknown> {
  const guild = oldMessage.guild ?? newMessage.guild;
  if (!guild) return;
  const guildDoc = await getGuildDoc(guild.id);
  if (!guildDoc) return;
  const messageLogsChannelId = guildDoc.messageLogsChannelID;
  if (!messageLogsChannelId) return;

  if (oldMessage.channel.id === messageLogsChannelId) return;

  const channel = guild.channels.cache.find(channel => channel.id === messageLogsChannelId) as TextChannel;
  if (!channel) return;

  const logEmbed = new MessageEmbed()
    .setColor('PURPLE')
    .setAuthor(`${oldMessage.author.tag} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
    .setDescription(
      `**Message Edited by ${oldMessage.author} in ${oldMessage.channel}:**\n\n**Before:** ${oldMessage.content}\n**After:** ${newMessage.content}`,
    )
    .setTimestamp();

  return channel.send({ embeds: [logEmbed] });
}
