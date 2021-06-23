import { guildDocs } from '../index.js';
import { MessageEmbed } from 'discord.js';
import { GuildModel } from '../schemas/index.js';
import type { Message, MessageComponentInteraction, Snowflake, User } from 'discord.js';
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

/**
 * A function that abstracts try/catch block for component interaction collector into a monad
 * @param message Message to create component interaction collector on
 * @param filter The function for filtering component interactions
 * @param collectorTime The time for which the collector should be active
 * @returns An array containing collected item and error, only one of them can be non-null at a time
 */
export async function collectMessageComponentInteraction(
  message: Message,
  filter: (collectedComponentInteraction: MessageComponentInteraction) => boolean,
  collectorTime?: number,
): Promise<[MessageComponentInteraction | null, Error | null]> {
  try {
    const response = await message.awaitMessageComponentInteraction(filter, { time: collectorTime });
    return [response, null];
  } catch (error) {
    return [null, error];
  }
}
