import type { Client, Message } from 'discord.js';
import type { Event } from '../typings';

export const event: Event = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message, client: Client): Promise<void> {
    if (message.author.bot) return;
    if (message.content.includes('?deploy') && message.author.id === '620567262004248596') {
      const commandData = client.commands.map(command => command.data);
      const count = (await message.guild?.commands.set(commandData))?.size;
      if (count) message.channel.send(`Deployed \`${count}\` interaction ${count > 1 ? 'cmds' : 'cmd'}`);
      else message.channel.send(`Deployed nothing`);
    }
  },
};
