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
   * The details about commands that are available in the guild
   */
  applicationCommands: Array<ApplicationCommandDocument>;

  /**
   * The id of the channel where member logs should be sent
   */
  memberLogsChannelId?: Snowflake;

  /**
   * The id of the channel where message logs should be sent
   */
  messageLogsChannelId?: Snowflake;
}

export interface ApplicationCommandDocument {
  /**
   * The name of the application command
   */
  name: string;

  /**
   * The permissions data of the application command
   */
  permissions: Array<ApplicationCommandPermissionData>;
}
