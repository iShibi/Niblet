import type { Db } from 'mongodb';
import type { GuildDocument } from './Guild';
import type { InteractionCommand } from './Interaction';
import type { Collection, Snowflake } from 'discord.js';

declare module 'discord.js' {
  interface Client {
    commands: Collection<Snowflake, InteractionCommand>;
    guildDocs: Collection<Snowflake, GuildDocument>;
    mongoDb: Db;
  }
}
