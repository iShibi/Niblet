import type { Client, Interaction } from 'discord.js';
import type { Event } from '../typings';

export const event: Event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: Client) {
    if (interaction.isCommand()) {
      try {
        client.commands.get(interaction.commandName)?.handle(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
