import type { Collection, Interaction } from 'discord.js';
import type { Event, InteractionCommand } from '../typings/index';

export const event: Event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, _, interactionCommands: Collection<string, InteractionCommand>) {
    if (interaction.isCommand()) {
      try {
        interactionCommands.get(interaction.commandName)?.handle(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
