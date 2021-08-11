import { logMember } from '../features/memberLog';
import { addMemberRoles } from '../features/rolePersistence';
import type { GuildMember } from 'discord.js';
import type { Event } from '../typings/index';

export const event: Event = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member: GuildMember) {
    logMember(member, 'ADD');
    if (member.guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED')) return;
    addMemberRoles(member);
  },
};
