import mongoose, { Schema, Document } from 'mongoose';
import type { IMovie, Genre } from '../types';
import { VALIDATION } from '../constants';

// Mongoose document interface
export interface IMovieDocument extends Omit<IMovie, 'id'>, Document {}

// Movie schema
const movieSchema = new Schema<IMovieDocument>(
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
      validate: {
        validator: (v: string[]): boolean => v.length > 0,
        message: VALIDATION.ACTOR_REQUIRED,
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
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });

export const Movie = mongoose.model<IMovieDocument>('Movie', movieSchema);

export default Movie;

