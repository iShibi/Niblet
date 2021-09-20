import type { ApplicationCommandPermissionData, Snowflake } from 'discord.js';

export interface GuildDocument {
  name: string;

  /**
   * The id of the guild
   */
  id: Snowflake;
  memberLogsChannelId?: Snowflake;
  messageLogsChannelId?: Snowflake;
  slashCommands?: Array<GuildDocumentSlashCommands>;
}

export interface GuildDocumentSlashCommands {
  name: string;
  permissions: Array<ApplicationCommandPermissionData>;
}
