import type { InteractionCommand } from '../../interfaces/index';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'warn',
    description: 'Warns a member of the guild',
    options: [
      {
        name: 'member',
        type: 'USER',
        description: 'The member who is to be warned',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'The reason for the warning',
        required: true,
      },
    ],
  },

  async handle(interaction) {
    const member = interaction.options.get('member')?.member;
    const reason = interaction.options.get('reason')?.value;
    interaction.reply(`Warning for ${member}: ${reason}`);
  },
};
