'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import UserModel from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import { makeUserHistoryEmbed } from '../../features/userHistoryEmbed.js';

export const command: Command = {
  name: 'kick',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.KICK_MEMBERS],
  aliases: ['k'],
  description: 'Kick a user from the guild',
  category: 'moderation',
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const memberToKick = await resolveMentionedMember(message, args);
    if (!memberToKick) return message.channel.send('That user is not a member of this server');

    const reason = `Kicked by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    const authorCanKick = message.member?.roles.highest.comparePositionTo(memberToKick.roles.highest) as number;
    if (memberToKick.kickable && (authorCanKick > 0 || message.member?.id === message.guild?.ownerID)) {
      try {
        UserModel.findOne({ id: memberToKick.id }, (err: Error, doc: UserSchemaInterface) => {
          if (err) {
            console.log(err);
            return message.channel.send('An error occured!');
          } else {
            const historyEmbed = makeUserHistoryEmbed(doc, memberToKick.user);
            message.channel.send(`Are you sure you want to kick ${memberToKick.user}?`, historyEmbed);
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
          await memberToKick.kick(reason);
          UserModel.findOne({ id: memberToKick.id }, (err: Error, doc: UserSchemaInterface) => {
            if (err) {
              console.log(err);
            } else if (doc) {
              doc.kicks += 1;
              doc.save();
            } else {
              const newUserDoc = new UserModel({
                username: memberToKick.user.username,
                id: memberToKick.id,
                tag: memberToKick.user.tag,
                kicks: 1,
              });
              newUserDoc.save();
            }
          });
          return message.channel.send(`Successfully kicked ${memberToKick.user.tag}`);
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
