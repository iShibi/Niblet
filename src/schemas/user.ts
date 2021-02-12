import mongoose from 'mongoose';

export interface UserSchemaInterface extends mongoose.Document {
  username: string;
  id: string;
  tag: string;
  warnings: number;
  restrictions: number;
  mutes: number;
  kicks: number;
  bans: number;
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
  username: String,
  id: String,
  tag: String,
  warnings: { type: Number, default: 0 },
  restrictions: { type: Number, default: 0 },
  mutes: { type: Number, default: 0 },
  kicks: { type: Number, default: 0 },
  bans: { type: Number, default: 0 },
});

export default mongoose.model<UserSchemaInterface>('user', UserSchema);
