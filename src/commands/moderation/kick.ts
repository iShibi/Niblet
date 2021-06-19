import type { Snowflake } from 'discord.js';
import type { InteractionCommand } from '../../interfaces/index';

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
    await interaction.reply('Kicking...');
    const author = interaction.user;
    const member = interaction.options.get('member')?.value as Snowflake;
    const reason = interaction.options.get('reason')?.value as string;
    const kickedMember = await interaction.guild?.members.kick(member, `Kicked by ${author.tag} | ${reason}`);
    interaction.editReply(`Successfully Kicked ${kickedMember}`);
  },
};
