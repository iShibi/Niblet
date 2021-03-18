'use strict';

import type { GuildMember } from 'discord.js';
import { log } from '../features/memberLogger.js';
import { addRolesBack } from '../features/rolePersistence.js';
import type { Event } from '../interfaces/Event';

export const event: Event = {
  name: 'guildMemberAdd',
  execute(member: GuildMember): void {
    log(member, 'join');
    addRolesBack(member);
  },
};
