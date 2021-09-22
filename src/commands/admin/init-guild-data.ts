import { initGuildDatabase } from '../../utils/Utility';
import type { InteractionCommand } from '../../typings';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'init-guild-data',
    description: 'Initialize a new document overwriting the current one in the databse for the guild',
    defaultPermission: false,
    options: [
      {
        name: 'confirm',
        type: 'BOOLEAN',
        description: 'Are you sure?',
        required: true,
      },
    ],
  },

  async handle(interaction) {
    if (!interaction.isCommand()) return;
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }

    const confirm = interaction.options.get('confirm')?.value;

    if (confirm) {
      await initGuildDatabase(guild);
      return interaction.editReply('Created a new document in the databse for this guild');
    }

    return interaction.editReply('Did nothing!');
  },
};
