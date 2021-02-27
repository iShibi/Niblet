'use strict';

import type { Message } from 'discord.js';
import { logEditedMessage } from '../features/editedMessageLogger.js';

export const event = (oldMessage: Message, newMessage: Message): void => {
  if (oldMessage.content === newMessage.content) return;
  logEditedMessage(oldMessage, newMessage);
};
