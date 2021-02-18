'use strict';

import type { Message } from 'discord.js';
import type { Command } from '../../interfaces/Command';

export const command: Command = {
  name: 'ping',
  description: 'Check the bot is working or not',
  category: 'fun',
  execute(message: Message): void {
    message.channel.send('Pong!');
  },
};
