'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedUser } from '../../utils/Utility.js';
import UserModel from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import { makeUserHistoryEmbed } from '../../features/userHistoryEmbed.js';

export const command: Command = {
  name: 'unban',
  args: true,
  usage: '<member> <reason>',
  permissions: [permissions.BAN_MEMBERS],
  description: 'Unban a user',
  category: 'moderation',
  async execute(message: Message, args: Array<string>): Promise<void | Message> {
    const userToUnban = await resolveMentionedUser(message, args);
    if (!userToUnban) return message.channel.send('Not a valid user.');

    const reason = `Unbanned by ${message.author.tag} | ${args.slice(1).join(' ')}`;

    try {
      UserModel.findOne({ id: userToUnban.id }, (err: Error, doc: UserSchemaInterface) => {
        if (err) {
          console.log(err);
          return message.channel.send('An error occured!');
        } else {
          const historyEmbed = makeUserHistoryEmbed(doc, userToUnban);
          message.channel.send(`Are you sure you want to unban ${userToUnban}?`, historyEmbed);
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
        await message.guild?.members.unban(userToUnban, reason);
        return message.channel.send(`Successfully unbanned ${userToUnban.tag}`);
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
