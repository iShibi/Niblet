import type { Event } from '../typings';
import type { GuildMember } from 'discord.js';
import { logMember } from '../features/memberLogging';
import { addMemberRoles } from '../features/rolePersistence';

export const event: Event = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member: GuildMember) {
    logMember(member, 'ADD');
    if (member.guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED')) return;
    addMemberRoles(member);
  },
};
