import type { ApplicationCommandPermissionData } from 'discord.js';
import type { GuildDocument, InteractionCommand } from '../../typings';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'slash-cmd-access',
    description: 'Configure slash commands access',
    defaultPermission: false,
    options: [
      {
        name: 'for-role',
        description: 'Configure access to slash commands for a role',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'role',
            description: 'The role to configure access for',
            type: 'ROLE',
            required: true,
          },
          {
            name: 'action',
            description: 'The action to perform for the role',
            type: 'STRING',
            choices: [
              {
                name: 'LOCK',
                value: 'lock',
              },
              {
                name: 'UNLOCK',
                value: 'unlock',
              },
            ],
            required: true,
          },
          {
            name: 'slash-cmd-name',
            description: 'The slash command to lock or unlock for this role',
            type: 'STRING',
            required: true,
          },
        ],
      },
      {
        name: 'for-user',
        description: 'Configure access to slash commands for a user',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'user',
            description: 'The user to configure access for',
            type: 'USER',
            required: true,
          },
          {
            name: 'action',
            description: 'The action to perform for the user',
            type: 'STRING',
            choices: [
              {
                name: 'LOCK',
                value: 'lock',
              },
              {
                name: 'UNLOCK',
                value: 'unlock',
              },
            ],
            required: true,
          },
          {
            name: 'slash-cmd-name',
            description: 'The slash cmd to lock or unlock for this user',
            type: 'STRING',
            required: true,
          },
        ],
      },
    ],
  },

  async handle(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('This command is only valid in a guild');
    }

    const subCommandName = interaction.options.getSubcommand() as 'for-role' | 'for-user';

    if (subCommandName === 'for-role') {
      const role = interaction.options.get('role', true).role;
      if (!role) return interaction.editReply('Provide a valid role to perform the action on.');

      const nameOfSlashCmdToConfigure = interaction.options.get('slash-cmd-name', true).value;
      const slashCommand =
        guild.commands.cache.find(cmd => cmd.name === nameOfSlashCmdToConfigure) ??
        (await guild.commands.fetch()).find(cmd => cmd.name === nameOfSlashCmdToConfigure);
      if (!slashCommand) return interaction.editReply(`The slash cmd \`${nameOfSlashCmdToConfigure}\` does not exist.`);

      const action = interaction.options.get('action', true).value as 'lock' | 'unlock';
      if (!action) return interaction.editReply('Provide a valid action to perform on the role');

      const permissionData: Array<ApplicationCommandPermissionData> = [
        {
          id: role.id,
          type: 'ROLE',
          permission: action === 'unlock' ? true : false,
        },
      ];

      await interaction.guild.commands.permissions.add({
        command: slashCommand,
        permissions: permissionData,
      });

      const guildDataToSave: GuildDocument = {
        id: guild.id,
        name: guild.name,
        slashCommands: [
          {
            name: slashCommand.name,
            permissions: permissionData,
          },
        ],
      };

      // TODO: this will overwrite slashCommands array in database. Fix it
      await interaction.client.mongoDb
        .collection<GuildDocument>('guilds')
        .findOneAndUpdate({ id: guild.id }, { $set: guildDataToSave }, { upsert: true, returnDocument: 'after' });

      return interaction.editReply(
        `${action}ed the slash command \`${nameOfSlashCmdToConfigure}\` for \`${role.name}\` role`,
      );
    } else if (subCommandName === 'for-user') {
      const user = interaction.options.get('user', true).user;
      if (!user) return interaction.editReply('Provide a valid user to perform the action on.');

      const nameOfSlashCmdToConfigure = interaction.options.get('slash-cmd-name', true).value;
      const slashCommand =
        guild.commands.cache.find(cmd => cmd.name === nameOfSlashCmdToConfigure) ??
        (await guild.commands.fetch()).find(cmd => cmd.name === nameOfSlashCmdToConfigure);
      if (!slashCommand) return interaction.editReply(`The slash cmd \`${nameOfSlashCmdToConfigure}\` does not exist.`);

      const action = interaction.options.get('action', true).value as 'lock' | 'unlock';
      if (!action) return interaction.editReply('Provide a valid action to perform on the user');

      const permissionData: Array<ApplicationCommandPermissionData> = [
        {
          id: user.id,
          type: 'USER',
          permission: action === 'unlock' ? true : false,
        },
      ];

      await interaction.guild.commands.permissions.add({
        command: slashCommand,
        permissions: permissionData,
      });

      const guildDataToSave: GuildDocument = {
        id: guild.id,
        name: guild.name,
        slashCommands: [
          {
            name: slashCommand.name,
            permissions: permissionData,
          },
        ],
      };

      // TODO: this will overwrite slashCommands array in database. Fix it
      await interaction.client.mongoDb
        .collection<GuildDocument>('guilds')
        .findOneAndUpdate({ id: guild.id }, { $set: guildDataToSave }, { upsert: true, returnDocument: 'after' });

      return interaction.editReply(
        `${action}ed the slash command \`${nameOfSlashCmdToConfigure}\` for user \`${user.username}\``,
      );
    }
  },
};
