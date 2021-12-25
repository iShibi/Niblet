import type { GuildMember } from 'discord.js';

export async function storeMemberRoles(member: GuildMember): Promise<unknown> {
  const { user, guild, client } = member;
  const roleIds = member.roles.cache.map(role => role.id).filter(id => id !== guild.id);
  return await client.prisma.user.upsert({
    where: {
      id_guildId: {
        id: user.id,
        guildId: guild.id,
      },
    },
    update: {
      roles: roleIds,
    },
    create: {
      id: user.id,
      guildId: guild.id,
      roles: roleIds,
    },
  });
}

export async function addMemberRoles(member: GuildMember): Promise<unknown> {
  const userDoc = await member.client.prisma.user.findUnique({
    where: {
      id_guildId: {
        id: member.id,
        guildId: member.guild.id,
      },
    },
  });
  if (!userDoc || typeof userDoc.roles === 'undefined') return;
  return member.roles.add(userDoc.roles, 'Roles Persistence');
}
