import type { Collection, Snowflake } from 'discord.js';
import type { Db } from 'mongodb';
import { GuildDocument } from './Guild';
import type { InteractionCommand } from './Interaction';

declare module 'discord.js' {
  interface Client {
    commands: Collection<Snowflake, InteractionCommand>;
    guildDocs: Collection<Snowflake, GuildDocument>;
    mongoDb: Db;
  }
}
