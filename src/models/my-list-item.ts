import mongoose, { Schema, Document } from 'mongoose';
import type { IMyListItem, Genre, ContentType } from '../types';

// Mongoose document interface
export interface IMyListItemDocument extends Omit<IMyListItem, 'id'>, Document {}

// MyListItem schema - denormalized for fast reads
const myListItemSchema = new Schema<IMyListItemDocument>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    content_id: {
      type: String,
      required: true,
    },
    content_type: {
      type: String,
      enum: ['movie', 'tvshow'] as ContentType[],
      required: true,
    },
    added_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Denormalized content data for fast retrieval
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] as Genre[],
      required: true,
    },
    release_date: {
      type: Date,
      required: true,
    },
    director: {
      type: String,
      trim: true,
    },
    actors: {
      type: [String],
      required: true,
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

// Compound unique index: prevents duplicates per user
myListItemSchema.index({ user_id: 1, content_id: 1 }, { unique: true });

// Index for pagination queries (sorted by newest first)
// Covers both offset and cursor pagination with user_id filter
myListItemSchema.index({ user_id: 1, added_at: -1 });

// Composite index for cursor pagination with tie-breaker
// Enables efficient cursor queries: WHERE user_id = ? AND (added_at < ? OR (added_at = ? AND _id < ?))
myListItemSchema.index({ user_id: 1, added_at: -1, _id: -1 });

// Index for content lookup
myListItemSchema.index({ content_id: 1, content_type: 1 });

export const MyListItem = mongoose.model<IMyListItemDocument>('MyListItem', myListItemSchema);

export default MyListItem;

