import type { GuildDocument, InteractionCommand } from '../../typings';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'setup',
    description: 'Configure information about this guild',
    defaultPermission: false,
    options: [
      {
        name: 'member-logs-channel',
        type: 'CHANNEL',
        description: 'The channel to send the member logs in',
      },
      {
        name: 'message-logs-channel',
        type: 'CHANNEL',
        description: 'The channel to send the message logs in',
      },
    ],
  },

  async handle(interaction) {
    if (!interaction.isCommand()) return;
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }

    const memberLogsChannelId = interaction.options.get('member-logs-channel')?.channel?.id;
    const messageLogsChannelId = interaction.options.get('message-logs-channel')?.channel?.id;

    await interaction.client.mongoDb
      .collection<GuildDocument>('guilds')
      .findOneAndUpdate({ id: guild.id }, { $set: { memberLogsChannelId, messageLogsChannelId } }, { upsert: true });

    return interaction.editReply('Added the provided guild data to the database');
  },
};
