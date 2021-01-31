import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { buildMention } from '../../utils/memberMentionBuilder.js';

export const command: Command = {
  name: 'warn',
  // usage: '<member> <reason>',
  execute(message: Message, args: Array<string>): void {
    const memberMention = buildMention(message);
    const reason: string = args.slice(1).join(' ');

    if (memberMention) {
      message.channel.send(`Warning for ${memberMention}: ${reason}`);
    }
  },
};
