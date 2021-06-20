import { UserModel } from '../../schemas/User.js';
import { createUserHistoryEmbed } from '../../utils/Utility.js';
import { Message, MessageActionRow, MessageButton } from 'discord.js';
import type { User } from 'discord.js';
import type { MessageComponentInteraction } from 'discord.js';
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
    const author = interaction.user;
    const targetUser = interaction.options.get('member')?.user as User;
    const reason = interaction.options.get('reason')?.value;
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomID('kick').setLabel('Kick').setStyle('DANGER'),
      new MessageButton().setCustomID('cancel_kick').setLabel('Cancel').setStyle('SECONDARY'),
    );
    const userDoc = await UserModel.findOne({ id: targetUser?.id }).exec();
    const userHistoryEmbed = createUserHistoryEmbed(userDoc, targetUser);
    await interaction.editReply({
      content: `Do you want to kick this user?`,
      embeds: [userHistoryEmbed],
      components: [buttonRow],
    });
    const message = (await interaction.fetchReply()) as Message;
    const filter = (i: MessageComponentInteraction) =>
      ['kick', 'cancel_kick'].includes(i.customID) && i.user.id === author.id;
    const response = await message.awaitMessageComponentInteraction(filter, { time: 15000 });
    if (response.customID === 'kick') {
      const kickedMember = await interaction.guild?.members.kick(targetUser, `Kicked by ${author.tag} | ${reason}`);
      interaction.editReply({ content: `Successfully Kicked ${kickedMember}`, embeds: [], components: [] });
      if (userDoc) {
        // @ts-ignore
        userDoc.kicks += 1;
        userDoc.save();
      } else {
        const newUserData: UserSchema = {
          username: targetUser?.username,
          id: targetUser?.id,
          tag: targetUser?.tag,
          kicks: 1,
        };
        const newUserDoc = new UserModel(newUserData);
        newUserDoc.save();
      }
    } else {
      interaction.deleteReply();
    }
  },
};
