import type { GuildMember } from 'discord.js';
import { UserDocument } from '../typings';

export async function storeMemberRoles(member: GuildMember): Promise<unknown> {
  const user = member.user;
  const guild = member.guild;
  const membersRoleIds = member.roles.cache.map(role => role.id).filter(id => id !== guild.id);
  const newUserData: UserDocument = {
    username: user.username,
    id: user.id,
    tag: user.tag,
    guildID: guild.id,
    roles: membersRoleIds,
  };
  return await member.client.mongoDb
    .collection<UserDocument>('users')
    .findOneAndUpdate({ id: user.id, guildID: guild.id }, { $set: newUserData }, { upsert: true });
}

export async function addMemberRoles(member: GuildMember): Promise<unknown> {
  const userDoc = await member.client.mongoDb
    .collection<UserDocument>('users')
    .findOne({ id: member.id, guildID: member.guild.id });
  if (!userDoc || typeof userDoc.roles === 'undefined') return;
  return member.roles.add(userDoc.roles, 'Roles Persistence');
}
