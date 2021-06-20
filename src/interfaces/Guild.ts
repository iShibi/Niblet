import mongoose from 'mongoose';
import type { Snowflake } from 'discord.js';

export interface GuildSchema {
  name: string;
  id: Snowflake;
  memberLogsChannelID: Snowflake | null;
  messageLogsChannelID: Snowflake | null;
}

export type GuildDocument = GuildSchema & mongoose.Document;
