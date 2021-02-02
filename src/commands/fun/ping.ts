'use strict';

import type { Message } from 'discord.js';
import type { Command } from '../../interfaces/Command';

export const command: Command = {
  name: 'ping',
  args: false,
  usage: '',
  permissions: [],
  execute(message: Message): void {
    message.channel.send('Pong!');
  },
};
