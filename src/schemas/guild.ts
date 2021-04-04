import mongoose from 'mongoose';
import type { Configuration } from '../interfaces/Configuration';

export interface GuildSchemaInterface extends mongoose.Document {
  name: string;
  id: string;
  // configuration: Configuration;
}

const GuildSchema: mongoose.Schema = new mongoose.Schema({
  name: String,
  id: String,
  // configuration: Object,
});

export default mongoose.model<GuildSchemaInterface>('guilds', GuildSchema);
