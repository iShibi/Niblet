import mongoose from 'mongoose';
import type { GuildSchema } from '../interfaces/index';

const guildSchema: mongoose.Schema = new mongoose.Schema({
  name: String,
  id: String,
  memberLogsChannelID: { type: String, default: null },
  messageLogsChannelID: { type: String, default: null },
});

export const GuildModel = mongoose.model<GuildSchema>('guild', guildSchema);
