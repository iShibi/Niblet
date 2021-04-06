import { logEditedMessage } from '../features/editedMessageLogger.js';
import type { Message } from 'discord.js';
import type { Event } from '../interfaces/Event';

export const event: Event = {
  name: 'messageUpdate',
  execute(oldMessage: Message, newMessage: Message): void {
    if (oldMessage.content === newMessage.content) return;
    logEditedMessage(oldMessage, newMessage);
  },
};
