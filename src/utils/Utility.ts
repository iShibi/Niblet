import type { GuildMember, Message, Snowflake, User } from 'discord.js';

export function buildMention(message: Message): string | null {
  const mentionedMember: GuildMember = message.mentions.members?.first() as GuildMember;
  if (mentionedMember) return `<@${mentionedMember.id}>`;

  const words: Array<string> = message.content.trim().split(/ +/);
  const memberID: Snowflake = words.find(word => /^\d{17,19}$/.test(word)) as Snowflake;
  if (memberID) return `<@${memberID}>`;

  return null;
}

export function getUserIdFromMessage(message: Message, args: Array<string>): string | null {
  const mentionedMember = message.mentions.members?.first();
  if (mentionedMember) return mentionedMember.id;
  const memberID = args.find(arg => /^\d{17,19}$/.test(arg));
  if (memberID) return memberID;
  return null;
}

export async function resolveMentionedMember(message: Message, args: Array<string>): Promise<GuildMember | null> {
  const mentionedMember = message.mentions.members?.first();
  if (mentionedMember) return mentionedMember;
  const mentionedMemberID = getUserIdFromMessage(message, args);
  if (mentionedMemberID) {
    let member = message.guild?.members.resolve(mentionedMemberID);
    if (member) return member;
    try {
      member = await message.guild?.members.fetch(mentionedMemberID);
      if (member) return member;
    } catch (err) {
      return null;
    }
  }
  return null;
}

export async function resolveMentionedUser(message: Message, args: Array<string>): Promise<User | null> {
  const mentionedUser = message.mentions.users.first();
  if (mentionedUser) return mentionedUser;
  const mentionedUserID = getUserIdFromMessage(message, args);
  if (mentionedUserID) {
    let user = message.client.users.resolve(mentionedUserID);
    if (user) return user;
    try {
      user = await message.client.users.fetch(mentionedUserID);
      if (user) return user;
    } catch (err) {
      return null;
    }
  }
  return null;
}
