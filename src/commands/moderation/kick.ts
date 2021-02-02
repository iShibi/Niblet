'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message, GuildMember } from 'discord.js';
import { permissions } from '../../utils/Constants.js';

export const command: Command = {
  name: 'kick',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.KICK_MEMBERS],
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const memberToKick: GuildMember = message.mentions.members?.first() as GuildMember;

    const reason = `Kicked by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    const authorCanKick = message.member?.roles.highest.comparePositionTo(memberToKick.roles.highest) as number;
    console.log(authorCanKick);
    if (memberToKick.kickable && (authorCanKick > 0 || message.member?.id === message.guild?.ownerID)) {
      try {
        message.channel.send(`Are you sure you want to kick ${memberToKick.user}?`);

        const filter = (msg: Message) => msg.author.id === message.author.id;
        const confirmationMessageCollection = await message.channel.awaitMessages(filter, {
          time: 10000,
          max: 1,
        });

        if (confirmationMessageCollection.first()?.content.toLowerCase() === 'y') {
          await memberToKick.kick(reason);
          return message.channel.send(`Successfully kicked ${memberToKick.user.tag}`);
        } else {
          return message.channel.send(`${message.author}, you took too much time!`);
        }
      } catch (error) {
        console.log('Not working', error);
      }
    } else {
      return message.channel.send('You know you cannot do that');
    }
  },
};
