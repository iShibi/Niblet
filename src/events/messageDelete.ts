'use strict';

import type { Message } from 'discord.js';
import { logDeletedMessage } from '../features/deletedMessageLogger.js';

export const event = (message: Message): void => {
  logDeletedMessage(message);
};
