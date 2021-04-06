import { MessageEmbed } from 'discord.js';
import { PREFIX } from '../../config.js';
import type { Command } from '../../interfaces/Command';
import type { Message, Collection } from 'discord.js';

export const command: Command = {
  name: 'help',
  description: 'Get a list of all cmds',
  category: 'utility',
  execute(message: Message, args: Array<string>, commands: Collection<string, Command>): Promise<Message> | void {
    const helpEmbed = new MessageEmbed().setTitle('Help');
    helpEmbed.setColor('BLUE');
    if (!args.length) {
      const catogries: Array<string> = [];
      commands.map(cmd => {
        if (!catogries.includes(cmd.category)) {
          catogries.push(cmd.category);
        }
      });
      let description = '';
      catogries.forEach(cat => {
        description += `\n\n**⮚ ${cat}**\n`;
        commands.forEach(cmd => {
          if (cmd.category === cat) {
            description += `\`${cmd.name}\` `;
          }
        });
      });
      description += `\n\nUse \`${PREFIX}help <command-name>\` to get more info about a specific cmd`;
      helpEmbed.setDescription(description);
      return message.channel.send(helpEmbed);
    } else {
      const searchedCmd = commands.find(cmd => cmd.name === args[0]);
      if (!searchedCmd) return message.channel.send('Search for a valid command.');
      helpEmbed.addField('Name:', searchedCmd.name);
      helpEmbed.addField('Description:', searchedCmd.description);
      helpEmbed.addField('Usage:', `${PREFIX}${searchedCmd.name} ${searchedCmd.usage ?? ''}`);
      helpEmbed.addField('Aliases:', `${searchedCmd.aliases ?? 'None'}`);
      helpEmbed.addField('Permissions:', `${searchedCmd.permissions ?? 'None'}`);
      return message.channel.send(helpEmbed);
    }
  },
};
