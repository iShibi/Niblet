import type { Snowflake } from 'discord.js';

export interface UserDocument {
  username: string;
  id: Snowflake;
  guildId: Snowflake;
  warnings?: number;
  restrictions?: number;
  mutes?: number;
  kicks?: number;
  softbans?: number;
  bans?: number;
  roles?: Array<string>;
}
