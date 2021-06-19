import type { Collection, Message } from 'discord.js';
import type { Event, InteractionCommand } from '../interfaces/index';

export const event: Event = {
  name: 'message',
  once: false,
  async execute(message: Message, _, interactionCommands: Collection<string, InteractionCommand>): Promise<void> {
    if (message.author.bot) return;
    if (message.content.includes('?deploy') && message.author.id === '620567262004248596') {
      const interactionCommandData = interactionCommands.map(interactionCommand => interactionCommand.data);
      await message.guild?.commands.set(interactionCommandData);
    }
  },
};
