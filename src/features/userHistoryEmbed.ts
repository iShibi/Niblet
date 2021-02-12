'use strict';

import type { UserSchemaInterface } from '../schemas/user.js';
import { MessageEmbed } from 'discord.js';
import type { GuildMember } from 'discord.js';

export function makeHistoryEmbed(data: UserSchemaInterface, member: GuildMember): MessageEmbed {
  const historyEmbed = new MessageEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL())
    .setColor('RED')
    .setFooter(
      // eslint-disable-next-line
      `warnings: ${data?.warnings ?? 0}, restrictions: ${data?.restrictions ?? 0}, mutes: ${data?.mutes ?? 0}, kicks: ${data?.kicks ?? 0
      }, bans: ${data?.bans ?? 0}`,
    );

  return historyEmbed;
}
