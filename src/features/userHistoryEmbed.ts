'use strict';

import type { UserSchemaInterface } from '../schemas/user.js';
import { MessageEmbed } from 'discord.js';
import type { User } from 'discord.js';

export function makeUserHistoryEmbed(data: UserSchemaInterface, user: User): MessageEmbed {
  const historyEmbed = new MessageEmbed()
    .setAuthor(`${user.tag} (${user.id}) ${data ? '✔️' : '❌'}`, user.displayAvatarURL())
    .setColor('RED')
    .setFooter(
      // eslint-disable-next-line
      `warnings: ${data?.warnings ?? 0}, restrictions: ${data?.restrictions ?? 0}, mutes: ${data?.mutes ?? 0}, kicks: ${data?.kicks ?? 0
      }, softbans: ${data?.softbans ?? 0}, bans: ${data?.bans ?? 0}`,
    );

  return historyEmbed;
}
