import type { InteractionCommand } from '../../typings';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'ping',
    description: 'Make the bot say Pong!',
  },

  async handle(interaction) {
    if (!interaction.isCommand()) return;
    interaction.reply({ ephemeral: true, content: 'Pong!' });
  },
};
