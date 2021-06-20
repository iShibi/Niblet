import { logEditedMessage } from '../features/messageLog.js';
import type { Message } from 'discord.js';
import type { Event } from '../interfaces/index';

export const event: Event = {
  name: 'messageUpdate',
  once: false,
  async execute(oldMessage: Message, newMessage: Message) {
    if (oldMessage.content === newMessage.content) return;
    logEditedMessage(oldMessage, newMessage);
  },
};
