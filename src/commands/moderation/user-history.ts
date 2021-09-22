import { InteractionCommand } from '../../typings';
import { createUserHistoryEmbed } from '../../utils/Utility';
// import { createUserHistoryEmbed } from '../../utils/Utility';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'user-history',
    defaultPermission: false,
    type: 'USER',
  },

  async handle(interaction) {
    if (!interaction.isContextMenu() || interaction.targetType !== 'USER') return;
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }
    const userHistoryEmbed = await createUserHistoryEmbed(interaction.targetId, interaction.guild);
    return interaction.editReply({ embeds: [userHistoryEmbed] });
  },
};
