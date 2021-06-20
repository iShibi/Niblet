import { guildDocs } from '../../index.js';
import { GuildModel } from '../../schemas/index.js';
import type { Snowflake } from 'discord.js';
import type { GuildSchema, InteractionCommand } from '../../interfaces/index';

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
    await interaction.defer();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }

    const memberLogsChannelID = interaction.options.get('member_logs_channel')?.value as Snowflake;
    const messageLogsChannelID = interaction.options.get('message_logs_channel')?.value as Snowflake;

    const guildDoc = await GuildModel.findOne({ id: guild.id }).exec();

    if (guildDoc) {
      guildDoc.memberLogsChannelID = memberLogsChannelID;
      guildDoc.messageLogsChannelID = messageLogsChannelID;
      const updatedGuildDoc = await guildDoc.save();
      guildDocs.set(guild.id, updatedGuildDoc);
      return interaction.editReply('Updated guild data in the database');
    } else {
      const newGuildData: GuildSchema = {
        id: guild.id,
        name: guild.name,
        memberLogsChannelID,
        messageLogsChannelID,
      };
      const newGuildDoc = new GuildModel(newGuildData);
      const newSavedGuildDoc = await newGuildDoc.save();
      guildDocs.set(guild.id, newSavedGuildDoc);
      return interaction.editReply('Added guild data to the database');
    }
  },
};
