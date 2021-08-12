import type { Message, MessageComponentInteraction, User } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { InteractionCommand, UserDocument } from '../../typings/index';
import { collectMessageComponentInteraction, createUserHistoryEmbed } from '../../utils/Utility';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'kick',
    description: 'Kicks a member from the guild',
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
        description: 'The reason for the kick',
        required: true,
      },
    ],
  },

  async handle(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }
    const author = interaction.user;
    const targetUser = interaction.options.get('member')?.user as User;
    const reason = interaction.options.get('reason')?.value;
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('kick').setLabel('Kick').setStyle('DANGER'),
      new MessageButton().setCustomId('cancel_kick').setLabel('Cancel').setStyle('SECONDARY'),
    );
    const userDoc = await interaction.client.mongoDb
      .collection<UserDocument>('users')
      .findOne({ id: targetUser.id, guildID: guild.id });
    const userHistoryEmbed = createUserHistoryEmbed(targetUser, userDoc);
    await interaction.editReply({
      content: `Do you want to kick this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });
    const message = (await interaction.fetchReply()) as Message;
    const filter = (collectedComponentInteraction: MessageComponentInteraction) => {
      collectedComponentInteraction.deferUpdate();
      return (
        ['kick', 'cancel_kick'].includes(collectedComponentInteraction.customId) &&
        collectedComponentInteraction.user.id === author.id
      );
    };
    const [response, error] = await collectMessageComponentInteraction(message, filter, 10000);
    if (error) return interaction.editReply({ content: 'You took too much time', embeds: [], components: [] });
    if (response && response.customId === 'kick') {
      const kickedMember = await guild.members.kick(targetUser, `Kicked by ${author.tag} | ${reason}`);
      interaction.editReply({ content: `Successfully Kicked ${kickedMember}`, embeds: [], components: [] });
      if (userDoc && typeof userDoc.kicks !== 'undefined') {
        return await interaction.client.mongoDb
          .collection<UserDocument>('users')
          .updateOne({ id: targetUser.id, guildID: guild.id }, { $inc: { kicks: 1 } });
      } else {
        const newUserData: UserDocument = {
          username: targetUser?.username,
          id: targetUser?.id,
          tag: targetUser?.tag,
          kicks: 1,
          guildID: guild.id,
        };
        return await interaction.client.mongoDb
          .collection<UserDocument>('users')
          .findOneAndUpdate({ id: targetUser.id, guildID: guild.id }, { $set: newUserData }, { upsert: true });
      }
    } else {
      interaction.deleteReply();
    }
  },
};
