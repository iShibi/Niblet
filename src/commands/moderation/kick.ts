'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import UserSchema from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';

export const command: Command = {
  name: 'kick',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.KICK_MEMBERS],
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const memberToKick = await resolveMentionedMember(message, args);
    if (!memberToKick) return message.channel.send('That user is not a member of this server');

    const reason = `Kicked by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    const authorCanKick = message.member?.roles.highest.comparePositionTo(memberToKick.roles.highest) as number;
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
          UserSchema.findOne({ id: memberToKick.id }, (err: Error, doc: UserSchemaInterface) => {
            if (err) {
              console.log(err);
            } else if (doc) {
              doc.kicks += 1;
              doc.save();
            } else {
              const newUserDoc = new UserSchema({
                username: memberToKick.user.username,
                id: memberToKick.id,
                tag: memberToKick.user.tag,
                kicks: 1,
              });
              newUserDoc.save();
            }
          });
          return message.channel.send(`Successfully kicked ${memberToKick.user.tag}`);
        } else {
          return message.channel.send(`${message.author}, you took too much time!`);
        }
      } catch (error) {
        console.log(error);
        return message.channel.send('An error occured!');
      }
    } else {
      return message.channel.send('You know you cannot do that');
    }
  },
};
