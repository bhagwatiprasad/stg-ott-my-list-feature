import mongoose, { Schema, Document } from 'mongoose';
import type { ITVShow, IEpisode, Genre } from '../types';
import { VALIDATION } from '../constants';

// Mongoose document interface
export interface ITVShowDocument extends Omit<ITVShow, 'id'>, Document {}

// Episode sub-schema
const episodeSchema = new Schema<IEpisode>(
  {
    episodeNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    seasonNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    actors: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

// TVShow schema
const tvShowSchema = new Schema<ITVShowDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    genres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] as Genre[],
      required: true,
      validate: {
        validator: (v: string[]): boolean => v.length > 0,
        message: VALIDATION.GENRE_REQUIRED,
      },
    },
    episodes: {
      type: [episodeSchema],
      required: true,
      validate: {
        validator: (v: IEpisode[]): boolean => v.length > 0,
        message: VALIDATION.EPISODE_REQUIRED,
      },
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

// Indexes for search
tvShowSchema.index({ title: 'text', description: 'text' });
tvShowSchema.index({ genres: 1 });

export const TVShow = mongoose.model<ITVShowDocument>('TVShow', tvShowSchema);

export default TVShow;

