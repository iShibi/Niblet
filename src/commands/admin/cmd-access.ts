import type { ApplicationCommandPermissionData } from 'discord.js';
import type { GuildDocument, InteractionCommand } from '../../typings';

export const interactionCommand: InteractionCommand = {
  data: {
    name: 'cmd-access',
    description: 'Configure application commands access',
    defaultPermission: false,
    options: [
      {
        name: 'for-role',
        description: 'Configure access to application commands for a role',
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
            name: 'cmd-name',
            description: 'The application command to lock or unlock for this role',
            type: 'STRING',
            required: true,
          },
        ],
      },
      {
        name: 'for-user',
        description: 'Configure access to application commands for a user',
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
            name: 'cmd-name',
            description: 'The application cmd to lock or unlock for this user',
            type: 'STRING',
            required: true,
          },
        ],
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

    const subCommandName = interaction.options.getSubcommand() as 'for-role' | 'for-user';

    if (subCommandName === 'for-role') {
      const role = interaction.options.get('role', true).role;
      if (!role) return interaction.editReply('Provide a valid role to perform the action on.');

      const nameOfCommandToConfigure = interaction.options.get('cmd-name', true).value;
      const command =
        guild.commands.cache.find(cmd => cmd.name === nameOfCommandToConfigure) ??
        (await guild.commands.fetch()).find(cmd => cmd.name === nameOfCommandToConfigure);
      if (!command) return interaction.editReply(`The command \`${nameOfCommandToConfigure}\` does not exist.`);

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
        command: command,
        permissions: permissionData,
      });

      await interaction.client.mongoDb
        .collection<GuildDocument>('guilds')
        .findOneAndUpdate(
          { id: guild.id },
          { $push: { 'applicationCommands.$[index].permissions': { $each: permissionData } } },
          { arrayFilters: [{ 'index.name': command.name }], upsert: true },
        );

      return interaction.editReply(`${action}ed the command \`${nameOfCommandToConfigure}\` for \`${role.name}\` role`);
    } else if (subCommandName === 'for-user') {
      const user = interaction.options.get('user', true).user;
      if (!user) return interaction.editReply('Provide a valid user to perform the action on.');

      const nameOfCommandToConfigure = interaction.options.get('cmd-name', true).value;
      const command =
        guild.commands.cache.find(cmd => cmd.name === nameOfCommandToConfigure) ??
        (await guild.commands.fetch()).find(cmd => cmd.name === nameOfCommandToConfigure);
      if (!command) return interaction.editReply(`The cmd \`${nameOfCommandToConfigure}\` does not exist.`);

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
        command: command,
        permissions: permissionData,
      });

      await interaction.client.mongoDb
        .collection<GuildDocument>('guilds')
        .findOneAndUpdate(
          { id: guild.id },
          { $push: { 'applicationCommands.$[index].permissions': { $each: permissionData } } },
          { arrayFilters: [{ 'index.name': command.name }], upsert: true },
        );

      return interaction.editReply(`${action}ed the command \`${nameOfCommandToConfigure}\` for \`${user.username}\``);
    }
  },
};
