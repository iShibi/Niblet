import { MessageActionRow, MessageButton } from 'discord.js';
import { collectButtonInteraction, createUserHistoryEmbed } from '../../utils/Utility';
import type { InteractionCommand } from '../../typings';
import type { Message, MessageComponentInteraction } from 'discord.js';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'warn',
    description: 'Warns a member of the guild',
    defaultPermission: false,
    options: [
      {
        name: 'member',
        type: 'USER',
        description: 'The member to warn',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'The reason for warning this member',
        required: true,
      },
    ],
  },

  async handle(interaction) {
    if (!interaction.isCommand()) return;

    const message = (await interaction.deferReply({ fetchReply: true })) as Message;

    const { guild } = interaction;
    if (!guild) return interaction.editReply('This command is only valid in a guild');

    const { user: author } = interaction;

    const userToWarn = interaction.options.get('member')?.user;
    if (!userToWarn) return interaction.editReply({ content: 'Provide a valid user to warn' });

    const reason = interaction.options.get('reason')?.value;

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('warn').setLabel('Warn').setStyle('DANGER'),
      new MessageButton().setCustomId('cancel_warn').setLabel('Cancel').setStyle('SECONDARY'),
    );

    const userHistoryEmbed = await createUserHistoryEmbed(userToWarn.id, guild);

    await interaction.editReply({
      content: `Do you want to warn this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });

    const filter = (i: MessageComponentInteraction) => {
      i.deferUpdate();
      return ['warn', 'cancel_warn'].includes(i.customId) && i.user.id === author.id;
    };

    const [response, error] = await collectButtonInteraction(message, filter, 10000);

    if (error) return interaction.editReply({ content: 'You took too much time', embeds: [], components: [] });

    if (response && response.customId === 'warn') {
      interaction.editReply({ content: `${userToWarn}: ${reason}`, embeds: [], components: [] });
      await interaction.client.prisma.user.upsert({
        where: {
          id_guildId: {
            id: userToWarn.id,
            guildId: guild.id,
          },
        },
        update: {
          warnings: {
            increment: 1,
          },
        },
        create: {
          id: userToWarn.id,
          guildId: guild.id,
          warnings: 1,
        },
      });
    } else {
      interaction.deleteReply();
    }
  },
};
