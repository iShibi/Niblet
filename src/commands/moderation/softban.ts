'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import UserModel from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import { makeUserHistoryEmbed } from '../../features/userHistoryEmbed.js';

export const command: Command = {
  name: 'softban',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.BAN_MEMBERS],
  aliases: ['sb'],
  description: 'Ban and Unban a user to delete their messages',
  category: 'moderation',
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const memberToSoftban = await resolveMentionedMember(message, args);
    if (!memberToSoftban) return message.channel.send('Not a valid user.');

    const reason = `Softbanned by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    try {
      UserModel.findOne(
        { id: memberToSoftban.id, guildId: memberToSoftban.guild.id },
        (err: Error, doc: UserSchemaInterface) => {
          if (err) {
            console.log(err);
            return message.channel.send('An error occured!');
          } else {
            const historyEmbed = makeUserHistoryEmbed(doc, memberToSoftban.user);
            message.channel.send(`Are you sure you want to softban ${memberToSoftban}?`, historyEmbed);
          }
        },
      );

      const filter = (msg: Message) => msg.author.id === message.author.id;
      const confirmationMessageCollection = await message.channel.awaitMessages(filter, {
        time: 10000,
        max: 1,
      });

      const reply = confirmationMessageCollection.first()?.content.toLowerCase();
      if (!reply) return message.channel.send(`${message.author} you took too much time!`);
      if (reply === 'y' || reply === 'yes') {
        await memberToSoftban.ban({ reason: reason, days: 7 });
        UserModel.findOne(
          { id: memberToSoftban.id, guildId: memberToSoftban.guild.id },
          (err: Error, doc: UserSchemaInterface) => {
            if (err) {
              console.log(err);
            } else if (doc) {
              doc.softbans += 1;
              doc.save();
            } else {
              const newUserDoc = new UserModel({
                username: memberToSoftban.user.username,
                id: memberToSoftban.id,
                tag: memberToSoftban.user.tag,
                softbans: 1,
                guildId: memberToSoftban.guild.id,
              });
              newUserDoc.save();
            }
          },
        );
        await message.guild?.members.unban(memberToSoftban);
        return message.channel.send(`Successfully softbanned ${memberToSoftban.user.tag}`);
      } else if (reply === 'n' || reply === 'no') {
        return message.channel.send('Fine, not today. Command canceled.');
      } else {
        return message.channel.send('Not a valid reply, command canceled!');
      }
    } catch (error) {
      console.log(error);
      return message.channel.send('An error occured!');
    }
  },
};
