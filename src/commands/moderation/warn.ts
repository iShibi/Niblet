import { Message, MessageActionRow, MessageButton } from 'discord.js';
import type { MessageComponentInteraction } from 'discord.js';
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
    const author = interaction.user;
    const member = interaction.options.get('member')?.member;
    const reason = interaction.options.get('reason')?.value;
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomID('warn').setLabel('Warn').setStyle('DANGER'),
      new MessageButton().setCustomID('cancel_warn').setLabel('Cancel').setStyle('SECONDARY'),
    );
    await interaction.reply({ content: `Do you want to warn ${member}?`, components: [buttonRow] });
    const message = (await interaction.fetchReply()) as Message;
    const filter = (i: MessageComponentInteraction) =>
      ['warn', 'cancel_warn'].includes(i.customID) && i.user.id === author.id;
    const response = await message.awaitMessageComponentInteraction(filter, { time: 15000 });
    if (response.customID === 'warn') {
      interaction.editReply({ content: `Warning for ${member}: ${reason}`, components: [] });
    } else {
      interaction.deleteReply();
    }
  },
};
