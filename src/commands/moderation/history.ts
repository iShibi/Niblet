'use strict';

import type { Command } from '../../interfaces/Command';
import type { Message, GuildMember } from 'discord.js';
import { permissions } from '../../utils/Constants.js';
import { resolveMentionedMember } from '../../utils/Utility.js';
import UserSchema from '../../schemas/user.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import { makeHistoryEmbed } from '../../features/userHistoryEmbed.js';

export const command: Command = {
  name: 'history',
  args: true,
  usage: '<member>',
  permissions: [permissions.KICK_MEMBERS],
  async execute(message: Message, args: Array<string>): Promise<Message | undefined> {
    const mentionedMember = (await resolveMentionedMember(message, args)) as GuildMember;
    if (!mentionedMember) return message.channel.send('That member does not exist');
    UserSchema.findOne({ id: mentionedMember.id }, (err: Error, doc: UserSchemaInterface) => {
      if (err) {
        console.log(err);
        return message.channel.send('An error occured!');
      } else {
        const historyEmbed = makeHistoryEmbed(doc, mentionedMember);
        if (historyEmbed) return message.channel.send(historyEmbed);
      }
    });
  },
};
