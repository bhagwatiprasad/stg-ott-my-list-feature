// Genre types as specified in requirements
export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Fantasy' | 'Horror' | 'Romance' | 'SciFi';

// Content type for MyList items
export type ContentType = 'movie' | 'tvshow';

// Pagination type
export type PaginationType = 'offset' | 'cursor';

// User interface as specified in requirements
export interface IUser {
  id: string;
  username: string;
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}

// Movie interface as specified in requirements
export interface IMovie {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director: string;
  actors: string[];
}

// TVShow Episode interface
export interface IEpisode {
  episodeNumber: number;
  seasonNumber: number;
  releaseDate: Date;
  director: string;
  actors: string[];
}

// TVShow interface as specified in requirements
export interface ITVShow {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  episodes: IEpisode[];
}

// MyListItem interface - denormalized for fast reads
export interface IMyListItem {
  id: string;
  user_id: string;
  content_id: string;
  content_type: ContentType;
  added_at: Date;
  // Denormalized content data
  title: string;
  description: string;
  genres: Genre[];
  release_date: Date;
  director?: string;
  actors: string[];
}

// API Request types
export interface AddToListRequest {
  contentId: string;
  contentType: ContentType;
}

export interface ListItemsQuery {
  type?: PaginationType;
  page?: number;
  limit?: number;
  cursor?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface OffsetPagination {
  type: 'offset';
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CursorPagination {
  type: 'cursor';
  limit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type Pagination = OffsetPagination | CursorPagination;

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// Cache types
export interface CacheData<T> {
  data: T;
  cachedAt: number;
}

