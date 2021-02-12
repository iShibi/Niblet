'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import { permissions } from '../../utils/Constants.js';
import UserSchema from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';

export const command: Command = {
  name: 'warn',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.KICK_MEMBERS],
  async execute(message: Message, args: Array<string>): Promise<Message | void> {
    const mentionedMember = await resolveMentionedMember(message, args);
    if (!mentionedMember) return message.channel.send('Provide a valid member in the command!');
    const reason: string = args.slice(1).join(' ');
    if (!reason) return message.reply('Provide a valid reason for the warning.');

    if (mentionedMember) {
      UserSchema.findOne({ id: mentionedMember.id }, (err: Error, doc: UserSchemaInterface) => {
        if (err) {
          console.log(err);
          return message.channel.send('An error occured!');
        } else if (doc) {
          doc.warnings += 1;
          doc.save();
        } else {
          const newUserDoc = new UserSchema({
            username: mentionedMember.user.username,
            id: mentionedMember.id,
            tag: mentionedMember.user.tag,
            warnings: 1,
          });
          newUserDoc.save();
        }
      });
      return message.channel.send(`Warning for ${mentionedMember}: ${reason}`);
    }
  },
};
