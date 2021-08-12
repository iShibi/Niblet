import type { Snowflake } from 'discord.js';
import type { GuildDocument, InteractionCommand } from '../../typings/index';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'setup',
    description: 'Configure information about this guild',
    options: [
      {
        name: 'member_logs_channel',
        type: 'CHANNEL',
        description: 'The channel to send the member logs in',
        required: true,
      },
      {
        name: 'message_logs_channel',
        type: 'CHANNEL',
        description: 'The channel to send the message logs in',
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

    const memberLogsChannelID = interaction.options.get('member_logs_channel')?.value as Snowflake;
    const messageLogsChannelID = interaction.options.get('message_logs_channel')?.value as Snowflake;

    const guildDataToSave: GuildDocument = {
      id: guild.id,
      name: guild.name,
      memberLogsChannelID,
      messageLogsChannelID,
    };

    const savedGuildDoc = await interaction.client.mongoDb
      .collection<GuildDocument>('guilds')
      .findOneAndUpdate({ id: guild.id }, { $set: guildDataToSave }, { upsert: true, returnDocument: 'after' });

    if (!savedGuildDoc.value) return interaction.reply('Something went wrong');

    interaction.client.guildDocs.set(savedGuildDoc.value.id, savedGuildDoc.value);

    return interaction.editReply('Added guild data to the database');
  },
};
