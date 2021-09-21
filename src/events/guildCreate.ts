import type { Event, GuildDocument, GuildDocumentSlashCommands } from '../typings';
import type { Guild } from 'discord.js';

export const event: Event = {
  name: 'guildCreate',
  once: false,
  async execute(guild: Guild) {
    const guildDoc: GuildDocument = {
      id: guild.id,
      name: guild.name,
      slashCommands: guild.client.commands.map(cmd => {
        const slashCommandsData: GuildDocumentSlashCommands = {
          name: cmd.data.name,
          permissions: [],
        };
        return slashCommandsData;
      }),
    };

    const guildDocExist = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });

    if (!guildDocExist) {
      await guild.client.mongoDb.collection<GuildDocument>('guilds').insertOne(guildDoc);
    }
  },
};
