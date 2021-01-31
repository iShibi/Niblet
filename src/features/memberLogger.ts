'use strict';

import type { GuildMember, TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';

export function log(member: GuildMember, logType: string): void {
  let description = `• Profile: ${member}
  • Created: \`${member.user.createdAt.toUTCString()}\`
  • Joined: \`${member.joinedAt?.toUTCString()}\``;

  let embedColor: string;
  let footer: string;

  if (logType === 'join') {
    embedColor = 'GREEN';
    footer = 'User joined';
  } else {
    description += `\n• Left: \`${new Date().toUTCString()}\``;
    embedColor = 'RED';
    footer = 'User left';
  }

  const logEmbed: MessageEmbed = new MessageEmbed();

  logEmbed.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL());
  logEmbed.setDescription(description);
  logEmbed.setColor(embedColor);
  logEmbed.setFooter(footer);
  logEmbed.setTimestamp();

  const memberLogChannel: TextChannel = member.guild.channels.cache.find(
    channel => channel.name === 'member-logs',
  ) as TextChannel;
  if (memberLogChannel) {
    memberLogChannel.send(logEmbed);
  }
}
