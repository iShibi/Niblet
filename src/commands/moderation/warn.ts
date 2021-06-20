import { Message, MessageActionRow, MessageButton, User } from 'discord.js';
import { createUserHistoryEmbed } from '../../utils/Utility.js';
import type { MessageComponentInteraction } from 'discord.js';
import type { InteractionCommand, UserSchema } from '../../interfaces/index';

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
    await interaction.defer();
    const author = interaction.user;
    const targetUser = interaction.options.get('member')?.user;
    const reason = interaction.options.get('reason')?.value;
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomID('warn').setLabel('Warn').setStyle('DANGER'),
      new MessageButton().setCustomID('cancel_warn').setLabel('Cancel').setStyle('SECONDARY'),
    );
    // @ts-ignore
    const userHistoryData: UserSchema = {};
    const userHistoryEmbed = createUserHistoryEmbed(userHistoryData, targetUser as User);
    await interaction.editReply({
      content: `Do you want to warn this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });
    const message = (await interaction.fetchReply()) as Message;
    const filter = (i: MessageComponentInteraction) =>
      ['warn', 'cancel_warn'].includes(i.customID) && i.user.id === author.id;
    const response = await message.awaitMessageComponentInteraction(filter, { time: 15000 });
    if (response.customID === 'warn') {
      interaction.editReply({ content: `Warning for ${targetUser}: ${reason}`, embeds: [], components: [] });
    } else {
      interaction.deleteReply();
    }
  },
};
