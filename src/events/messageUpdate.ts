'use strict';

import type { Message } from 'discord.js';
import { logEditedMessage } from '../features/editedMessageLogger.js';

export const event = (oldMessage: Message, newMessage: Message): void => {
  logEditedMessage(oldMessage, newMessage);
};
