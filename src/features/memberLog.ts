import { MessageEmbed } from 'discord.js';
import { getGuildDoc } from '../utils/Utility.js';
import type { GuildMember } from 'discord.js';

export async function logMember(member: GuildMember, logType: MemberLogType): Promise<unknown> {
  const guild = member.guild;
  if (!guild) return;
  const guildDoc = await getGuildDoc(guild.id);
  if (!guildDoc) return;
  const memberLogsChannelID = guildDoc.memberLogsChannelID;
  if (!memberLogsChannelID) return;

  const channel = guild.channels.cache.find(channel => channel.id === memberLogsChannelID);
  if (!channel || !channel.isText()) return;

  let description = `• Profile: ${member}\n• Created: \`${member.user.createdAt.toUTCString()}\`\n• Joined: \`${member.joinedAt?.toUTCString()}\``;

  if (logType === 'REMOVE') description += `\n• Left: \`${new Date().toUTCString()}\``;

  const logEmbed = new MessageEmbed()
    .setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(description)
    .setColor(logType === 'ADD' ? 'GREEN' : 'RED')
    .setFooter(logType === 'ADD' ? 'User joined' : 'User left')
    .setTimestamp();

  channel.send({ embeds: [logEmbed] });
}

export type MemberLogType = 'ADD' | 'REMOVE';
