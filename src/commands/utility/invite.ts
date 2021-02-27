'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message, TextChannel } from 'discord.js';

export const command: Command = {
  name: 'invite',
  description: 'Sends an invite of the server',
  category: 'utility',
  async execute(message: Message): Promise<Message> {
    const channel = message.guild?.systemChannel as TextChannel;
    if (!channel) return message.channel.send('Set a system channel!');
    const invite = await channel.createInvite({ maxAge: 0 });
    return message.channel.send(`${invite.url}`);
  },
};
