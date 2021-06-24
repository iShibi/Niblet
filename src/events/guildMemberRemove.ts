import { logMember } from '../features/memberLog.js';
import { storeMemberRoles } from '../features/rolePersistence.js';
import type { GuildMember } from 'discord.js';
import type { Event } from '../interfaces/index.js';

export const event: Event = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member: GuildMember) {
    logMember(member, 'REMOVE');
    storeMemberRoles(member);
  },
};
