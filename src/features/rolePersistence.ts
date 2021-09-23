import type { GuildMember } from 'discord.js';
import type { UserDocument } from '../typings';

export async function storeMemberRoles(member: GuildMember): Promise<unknown> {
  const { user, guild, client } = member;
  const roleIds = member.roles.cache.map(role => role.id).filter(id => id !== guild.id);
  return await client.mongoDb
    .collection<UserDocument>('users')
    .findOneAndUpdate({ id: user.id, guildId: guild.id }, { $set: { roles: roleIds } }, { upsert: true });
}

export async function addMemberRoles(member: GuildMember): Promise<unknown> {
  const userDoc = await member.client.mongoDb
    .collection<UserDocument>('users')
    .findOne({ id: member.id, guildId: member.guild.id });
  if (!userDoc || typeof userDoc.roles === 'undefined') return;
  return member.roles.add(userDoc.roles, 'Roles Persistence');
}
