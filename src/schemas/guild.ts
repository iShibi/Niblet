import mongoose from 'mongoose';

export interface GuildSchemaInterface extends mongoose.Document {
  name: string;
  id: string;
  memberLogsChannelId: string | null;
  messageLogsChannelId: string | null;
}

const GuildSchema: mongoose.Schema = new mongoose.Schema({
  name: String,
  id: String,
  memberLogsChannelId: { type: String, default: null },
  messageLogsChannelId: { type: String, default: null },
});

export default mongoose.model<GuildSchemaInterface>('guilds', GuildSchema);
