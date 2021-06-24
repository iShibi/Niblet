import { UserModel } from '../schemas/index.js';
import type { GuildMember } from 'discord.js';
import type { UserSchema } from '../interfaces/User.js';

export async function storeMemberRoles(member: GuildMember): Promise<unknown> {
  const user = member.user;
  const guild = member.guild;
  const userDoc = await UserModel.findOne({ id: user.id, guildID: guild.id }).exec();
  const memberRoleIDs = member.roles.cache.map(role => role.id).filter(id => id !== guild.id);
  if (userDoc) {
    userDoc.roles = memberRoleIDs;
    return userDoc.save();
  } else {
    const newUserData: UserSchema = {
      username: user.username,
      id: user.id,
      tag: user.tag,
      guildID: guild.id,
      roles: memberRoleIDs,
    };
    const newUserDoc = new UserModel(newUserData);
    return newUserDoc.save();
  }
}

export async function addMemberRoles(member: GuildMember): Promise<unknown> {
  const userDoc = await UserModel.findOne({ id: member.id, guildID: member.guild.id }).exec();
  if (!userDoc || typeof userDoc.roles === 'undefined') return;
  return member.roles.add(userDoc.roles, 'Roles Persistence');
}
