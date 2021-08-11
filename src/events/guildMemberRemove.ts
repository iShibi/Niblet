import { logMember } from '../features/memberLog';
import { storeMemberRoles } from '../features/rolePersistence';
import type { GuildMember } from 'discord.js';
import type { Event } from '../typings/index';

export const event: Event = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member: GuildMember) {
    logMember(member, 'REMOVE');
    storeMemberRoles(member);
  },
};
