import type { Collection, Message } from 'discord.js';
import type { Event, InteractionCommand } from '../typings/index';

export const event: Event = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message, _, interactionCommands: Collection<string, InteractionCommand>): Promise<void> {
    if (message.author.bot) return;
    if (message.content.includes('?deploy') && message.author.id === '620567262004248596') {
      const interactionCommandData = interactionCommands.map(interactionCommand => interactionCommand.data);
      const cmds = await message.guild?.commands.set(interactionCommandData);
      if (cmds) message.channel.send(`Deployed \`${cmds.size}\` interaction ${cmds.size > 1 ? 'cmds' : 'cmd'}`);
      else message.channel.send(`Deployed nothing`);
    }
  },
};
