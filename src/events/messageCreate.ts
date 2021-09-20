import { deployGuildSlashCommads } from '../utils/Utility';
import type { Event } from '../typings';
import type { Message } from 'discord.js';

export const event: Event = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.content.includes('?deploy') && message.author.id === '620567262004248596') {
      const guild = message.guild;
      if (!guild) {
        message.reply('This command is only valid in a guild');
        return;
      }
      const createdSlashCommands = await deployGuildSlashCommads(guild);
      const count = createdSlashCommands?.size;
      if (count) message.channel.send(`Deployed \`${count}\` interaction ${count > 1 ? 'cmds' : 'cmd'}`);
      else message.channel.send(`Deployed nothing`);
    }

    if (message.content === '?delete') {
      await message.guild?.commands.set([]);
    }
  },
};
