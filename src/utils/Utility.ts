import type { GuildMember, Message, Snowflake } from 'discord.js';

export function buildMention(message: Message): string | null {
  const mentionedMember: GuildMember = message.mentions.members?.first() as GuildMember;
  if (mentionedMember) return `<@${mentionedMember.id}>`;

  const words: Array<string> = message.content.trim().split(/ +/);
  const memberID: Snowflake = words.find(word => /^\d{17,19}$/.test(word)) as Snowflake;
  if (memberID) return `<@${memberID}>`;

  return null;
}
