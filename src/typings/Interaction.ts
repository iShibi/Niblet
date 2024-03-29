import type { ApplicationCommandData, CommandInteraction, ContextMenuInteraction } from 'discord.js';

export interface InteractionCommand {
  /**
   * The data for an interaction command
   */
  data: ApplicationCommandData;

  /**
   * The function to call when an interaction is recieved
   */
  handle(interaction: CommandInteraction | ContextMenuInteraction): Promise<unknown>;
}
