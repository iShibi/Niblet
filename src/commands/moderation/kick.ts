import { UserModel } from '../../schemas/User.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { collectMessageComponentInteraction, createUserHistoryEmbed } from '../../utils/Utility.js';
import type { User } from 'discord.js';
import type { Message, MessageComponentInteraction } from 'discord.js';
import type { InteractionCommand, UserSchema } from '../../interfaces/index';

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
    await interaction.defer();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }
    const author = interaction.user;
    const targetUser = interaction.options.get('member')?.user as User;
    const reason = interaction.options.get('reason')?.value;
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomID('kick').setLabel('Kick').setStyle('DANGER'),
      new MessageButton().setCustomID('cancel_kick').setLabel('Cancel').setStyle('SECONDARY'),
    );
    const userDoc = await UserModel.findOne({ id: targetUser?.id, guildID: guild.id }).exec();
    const userHistoryEmbed = createUserHistoryEmbed(userDoc, targetUser);
    await interaction.editReply({
      content: `Do you want to kick this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });
    const message = (await interaction.fetchReply()) as Message;
    const filter = (collectedComponentInteraction: MessageComponentInteraction) =>
      ['kick', 'cancel_kick'].includes(collectedComponentInteraction.customID) &&
      collectedComponentInteraction.user.id === author.id;
    const [response, error] = await collectMessageComponentInteraction(message, filter, 10000);
    if (error) return interaction.editReply({ content: 'You took too much time', embeds: [], components: [] });
    if (response && response.customID === 'kick') {
      const kickedMember = await guild.members.kick(targetUser, `Kicked by ${author.tag} | ${reason}`);
      interaction.editReply({ content: `Successfully Kicked ${kickedMember}`, embeds: [], components: [] });
      if (userDoc && typeof userDoc.kicks !== 'undefined') {
        userDoc.kicks += 1;
        return userDoc.save();
      } else {
        const newUserData: UserSchema = {
          username: targetUser?.username,
          id: targetUser?.id,
          tag: targetUser?.tag,
          kicks: 1,
          guildID: guild.id,
        };
        const newUserDoc = new UserModel(newUserData);
        return newUserDoc.save();
      }
    } else {
      interaction.deleteReply();
    }
  },
};
