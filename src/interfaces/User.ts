import type { Snowflake } from 'discord.js';

export interface UserSchema {
  username: string;
  id: Snowflake;
  tag: string;
  warnings?: number;
  restrictions?: number;
  mutes?: number;
  kicks?: number;
  softbans?: number;
  bans?: number;
  roles?: Array<string>;
}
