import { Permissions } from 'discord.js';
import { resolveMentionedMember, resolveMentionedUser } from '../../utils/Utility.js';
import UserModel from '../../schemas/user.js';
import { makeUserHistoryEmbed } from '../../features/userHistoryEmbed.js';
import type { UserSchemaInterface } from '../../schemas/user.js';
import type { Command } from '../../interfaces/Command';
import type { Message, User } from 'discord.js';

export const command: Command = {
  name: 'history',
  args: true,
  usage: '<member>',
  permissions: [Permissions.FLAGS.KICK_MEMBERS],
  aliases: ['h'],
  description: 'Get the history of a user',
  category: 'moderation',
  async execute(message: Message, args: Array<string>): Promise<Message | void> {
    let mentionedMemberOrUser = (await resolveMentionedMember(message, args))?.user as User;
    if (!mentionedMemberOrUser) {
      mentionedMemberOrUser = (await resolveMentionedUser(message, args)) as User;
    }
    if (!mentionedMemberOrUser) return message.channel.send('Provide a valid user');
    // !!check what this does in DM
    UserModel.findOne(
      { id: mentionedMemberOrUser.id, guildId: message.guild?.id },
      (err: Error, doc: UserSchemaInterface) => {
        if (err) {
          console.log(err);
          return message.channel.send('An error occured!');
        } else {
          const historyEmbed = makeUserHistoryEmbed(doc, mentionedMemberOrUser);
          if (historyEmbed) return message.channel.send(historyEmbed);
        }
      },
    );
  },
};
