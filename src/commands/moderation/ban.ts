'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import UserSchema from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import { makeUserHistoryEmbed } from '../../features/userHistoryEmbed.js';

export const command: Command = {
  name: 'ban',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.BAN_MEMBERS],
  aliases: ['b'],
  description: 'Ban a member from the guild',
  category: 'moderation',
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const memberToBan = await resolveMentionedMember(message, args);
    if (!memberToBan) return message.channel.send('That user is not a member of this server');

    const reason = `Banned by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    const authorCanBan = message.member?.roles.highest.comparePositionTo(memberToBan.roles.highest) as number;
    if (memberToBan.bannable && (authorCanBan > 0 || message.member?.id === message.guild?.ownerID)) {
      try {
        UserSchema.findOne({ id: memberToBan.id }, (err: Error, doc: UserSchemaInterface) => {
          if (err) {
            console.log(err);
            return message.channel.send('An error occured!');
          } else {
            const historyEmbed = makeUserHistoryEmbed(doc, memberToBan.user);
            message.channel.send(`Are you sure you want to ban ${memberToBan.user}?`, historyEmbed);
          }
        });

        const filter = (msg: Message) => msg.author.id === message.author.id;
        const confirmationMessageCollection = await message.channel.awaitMessages(filter, {
          time: 10000,
          max: 1,
        });

        const reply = confirmationMessageCollection.first()?.content.toLowerCase();
        if (!reply) return message.channel.send(`${message.author} you took too much time!`);
        if (reply === 'y' || reply === 'yes') {
          await memberToBan.ban({ reason: reason, days: 7 });
          UserSchema.findOne({ id: memberToBan.id }, (err: Error, doc: UserSchemaInterface) => {
            if (err) {
              console.log(err);
            } else if (doc) {
              doc.bans += 1;
              doc.save();
            } else {
              const newUserDoc = new UserSchema({
                username: memberToBan.user.username,
                id: memberToBan.id,
                tag: memberToBan.user.tag,
                bans: 1,
              });
              newUserDoc.save();
            }
          });
          return message.channel.send(`Successfully banned ${memberToBan.user.tag}`);
        } else if (reply === 'n' || reply === 'no') {
          return message.channel.send('Fine, not today. Command canceled.');
        } else {
          return message.channel.send('Not a valid reply, command canceled!');
        }
      } catch (error) {
        console.log(error);
        return message.channel.send('An error occured!');
      }
    } else {
      return message.channel.send('You know you cannot do that :)');
    }
  },
};
