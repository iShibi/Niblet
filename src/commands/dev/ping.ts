import type { InteractionCommand } from '../../typings/index';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'ping',
    description: 'Checks whether or not the bot is online',
  },

  async handle(interaction) {
    return interaction.reply({ ephemeral: true, content: 'Pong!' });
  },
};
