'use strict';

import type { GuildMember } from 'discord.js';
import { log } from '../features/memberLogger.js';

export const event = (member: GuildMember): void => {
  log(member, 'left');
};
