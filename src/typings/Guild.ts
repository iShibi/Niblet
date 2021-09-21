import type { ApplicationCommandPermissionData, Snowflake } from 'discord.js';

export interface GuildDocument {
  /**
   * The name of the guild
   */
  name: string;

  /**
   * The id of the guild
   */
  id: Snowflake;

  /**
   * The details about slash commands that are available in the guild
   */
  slashCommands: Array<GuildDocumentSlashCommands>;

  /**
   * The id of the channel where member logs should be sent
   */
  memberLogsChannelId?: Snowflake;

  /**
   * The id of the channel where message logs should be sent
   */
  messageLogsChannelId?: Snowflake;
}

export interface GuildDocumentSlashCommands {
  /**
   * The name of the slash command
   */
  name: string;

  /**
   * The permissions data of the slash command
   */
  permissions: Array<ApplicationCommandPermissionData>;
}
