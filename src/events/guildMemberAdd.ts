import { log } from '../features/memberLogger.js';
import { addRolesBack } from '../features/rolePersistence.js';
import type { Event } from '../interfaces/Event';
import type { GuildMember } from 'discord.js';

export const event: Event = {
  name: 'guildMemberAdd',
  execute(member: GuildMember): void {
    log(member, 'join');
    addRolesBack(member);
  },
};
