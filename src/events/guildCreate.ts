import { initGuildDatabase } from '../utils/Utility';
import type { Guild } from 'discord.js';
import type { Event, GuildDocument } from '../typings';

export const event: Event = {
  name: 'guildCreate',
  once: false,
  async execute(guild: Guild) {
    const guildDocExist = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });

    if (!guildDocExist) {
      await initGuildDatabase(guild);
    }
  },
};
