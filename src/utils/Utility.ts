import { guildDocs } from '../index.js';
import { MessageEmbed } from 'discord.js';
import { GuildModel } from '../schemas/index.js';
import type { Snowflake, User } from 'discord.js';
import type { GuildDocument, UserSchema } from '../interfaces/index';

/**
 * Creates an embed containing information about a user's history
 * @returns An embed containing history of the provided user
 */
export function createUserHistoryEmbed(data: UserSchema | null, user: User): MessageEmbed {
  const userHistoryEmbed = new MessageEmbed()
    .setAuthor(`${user.tag} (${user.id}) ${data ? '✔️' : '❌'}`, user.displayAvatarURL())
    .setColor('RED')
    .setFooter(
      // eslint-disable-next-line
      `warnings: ${data?.warnings ?? 0}, restrictions: ${data?.restrictions ?? 0}, mutes: ${data?.mutes ?? 0}, kicks: ${data?.kicks ?? 0
      }, softbans: ${data?.softbans ?? 0}, bans: ${data?.bans ?? 0}`,
    );

  return userHistoryEmbed;
}

/**
 * Gets a guild document if it is cached, else fetches it from database
 * @returns A guild document
 */
export async function getGuildDoc(guildID: Snowflake, force?: boolean): Promise<GuildDocument | null> {
  if (!force) {
    const guildDoc = guildDocs.get(guildID);
    if (guildDoc) return guildDoc;
  }
  const guildDoc = await GuildModel.findOne({ id: guildID }).exec();
  return guildDoc;
}
