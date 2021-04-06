import UserModel from '../schemas/user.js';
import type { GuildMember } from 'discord.js';
import type { UserSchemaInterface } from '../schemas/user.js';

export function storeMemberRoles(member: GuildMember): void {
  UserModel.findOne({ id: member.id, guildId: member.guild.id }, (err: Error, doc: UserSchemaInterface) => {
    if (err) {
      console.log(err);
    } else if (doc) {
      const roleIds = member.roles.cache.map(role => role.id).filter(id => id != member.guild.id);
      doc.roles = roleIds;
      doc.save();
    } else {
      const newUserDoc = new UserModel({
        username: member.user.username,
        id: member.id,
        tag: member.user.tag,
        roles: member.roles.cache.map(role => role.id).filter(id => id != member.guild.id),
        guildId: member.guild.id,
      });
      newUserDoc.save();
    }
  });
}

export function addRolesBack(member: GuildMember): void {
  UserModel.findOne({ id: member.id, guildId: member.guild.id }, (err: Error, doc: UserSchemaInterface) => {
    if (err) {
      console.log(err);
    } else if (doc) {
      const reason = 'Persistent roles';
      member.roles.add(doc.roles, reason);
    }
  });
}
