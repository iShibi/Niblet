import type { Message } from 'discord.js';

export const command = {
  name: 'ping',
  async execute(message: Message, args: Array<string>): Promise<void> {
    message.channel.send('Pong!');
  },
};
