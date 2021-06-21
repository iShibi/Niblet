import { logEditedMessage } from '../features/messageLog.js';
import type { Message } from 'discord.js';
import type { Event } from '../interfaces/index';

export const event: Event = {
  name: 'messageUpdate',
  once: false,
  async execute(oldMessage: Message, newMessage: Message) {
    const authorID = oldMessage.author.id ?? newMessage.author.id;
    const clientID = oldMessage.client.user?.id ?? newMessage.client.user?.id;
    if (oldMessage.content === newMessage.content || authorID === clientID) return;
    logEditedMessage(oldMessage, newMessage);
  },
};
