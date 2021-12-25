import { MessageActionRow, MessageButton } from 'discord.js';
import { collectButtonInteraction, createUserHistoryEmbed } from '../../utils/Utility';
import type { InteractionCommand } from '../../typings';
import type { Message, MessageComponentInteraction } from 'discord.js';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'kick',
    description: 'Kicks a member from the guild',
    defaultPermission: false,
    options: [
      {
        name: 'member',
        type: 'USER',
        description: 'The member to kick',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'The reason for kicking this member',
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

    const userToKick = interaction.options.get('member')?.user;
    if (!userToKick) return interaction.editReply({ content: 'Provide a valid user to kick' });

    const reason = interaction.options.get('reason')?.value as string;

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('kick').setLabel('Kick').setStyle('DANGER'),
      new MessageButton().setCustomId('cancel_kick').setLabel('Cancel').setStyle('SECONDARY'),
    );

    const userHistoryEmbed = await createUserHistoryEmbed(userToKick.id, guild);

    await interaction.editReply({
      content: `Do you want to kick this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });

    const filter = (i: MessageComponentInteraction) => {
      i.deferUpdate();
      return ['kick', 'cancel_kick'].includes(i.customId) && i.user.id === author.id;
    };

    const [response, error] = await collectButtonInteraction(message, filter, 10000);

    if (error) return interaction.editReply({ content: 'You took too much time', embeds: [], components: [] });

    if (response && response.customId === 'kick') {
      await guild.members.kick(userToKick, reason);
      interaction.editReply({ content: `Successfully Kicked ${userToKick}`, embeds: [], components: [] });
      await interaction.client.prisma.user.upsert({
        where: {
          id_guildId: {
            id: userToKick.id,
            guildId: guild.id,
          },
        },
        update: {
          kicks: {
            increment: 1,
          },
        },
        create: {
          id: userToKick.id,
          guildId: guild.id,
          kicks: 1,
        },
      });
    } else {
      interaction.deleteReply();
    }
  },
};
