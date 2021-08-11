import type { Snowflake } from 'discord.js';

export interface GuildDocument {
  name: string;
  id: Snowflake;
  memberLogsChannelID: Snowflake | null;
  messageLogsChannelID: Snowflake | null;
}
