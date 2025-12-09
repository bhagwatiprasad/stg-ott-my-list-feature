import mongoose, { Schema, Document } from 'mongoose';
import type { IUser, Genre } from '../types';

// Mongoose document interface
export interface IUserDocument extends Omit<IUser, 'id'>, Document {}

// Watch history sub-schema
const watchHistorySchema = new Schema(
  {
    contentId: { type: String, required: true },
    watchedOn: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

// Preferences sub-schema
const preferencesSchema = new Schema(
  {
    favoriteGenres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] as Genre[],
      default: [],
    },
    dislikedGenres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] as Genre[],
      default: [],
    },
  },
  { _id: false }
);

// User schema
const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    preferences: {
      type: preferencesSchema,
      default: (): { favoriteGenres: Genre[]; dislikedGenres: Genre[] } => ({ favoriteGenres: [], dislikedGenres: [] }),
    },
    watchHistory: {
      type: [watchHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        ret.id = String(ret._id);
        ret._id = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
  }
);

// Note: username already has unique: true which creates an index automatically

export const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;

