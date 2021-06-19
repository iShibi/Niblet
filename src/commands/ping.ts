import type { InteractionCommand } from '../interfaces/index';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'ping',
    description: 'Checks whether or not the bot is online',
  },

  handle(interaction) {
    interaction.editReply('Pong!');
  },
};
