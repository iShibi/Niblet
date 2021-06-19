import type { Collection, Interaction } from 'discord.js';
import type { Event, InteractionCommand } from '../interfaces/index';

export const event: Event = {
  name: 'interaction',
  once: false,
  async execute(interaction: Interaction, _, interactionCommands: Collection<string, InteractionCommand>) {
    if (interaction.isCommand()) {
      interaction.defer({ ephemeral: true });
      try {
        interactionCommands.get(interaction.commandName)?.handle(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
