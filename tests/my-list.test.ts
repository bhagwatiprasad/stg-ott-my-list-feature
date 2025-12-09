/// <reference types="jest" />
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { User, Movie, TVShow, MyListItem } from '../src/models';
import type { Application } from 'express';

describe('My List API - Comprehensive Tests', () => {
  let app: Application;
  let userId: string;
  let movieId: string;
  let movie2Id: string;
  let movie3Id: string;
  let tvShowId: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      username: 'testuser',
      preferences: { favoriteGenres: ['Action'], dislikedGenres: [] },
      watchHistory: [],
    });
    userId = user._id.toString();

    // Create test movies
    const movie = await Movie.create({
      title: 'Test Movie',
      description: 'A test movie description',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('2024-01-01'),
      director: 'Test Director',
      actors: ['Actor 1', 'Actor 2'],
    });
    movieId = movie._id.toString();

    const movie2 = await Movie.create({
      title: 'Test Movie 2',
      description: 'Another test movie',
      genres: ['Comedy'],
      releaseDate: new Date('2024-02-01'),
      director: 'Another Director',
      actors: ['Actor 3'],
    });
    movie2Id = movie2._id.toString();

    const movie3 = await Movie.create({
      title: 'Test Movie 3',
      description: 'Third test movie',
      genres: ['Drama'],
      releaseDate: new Date('2024-03-01'),
      director: 'Third Director',
      actors: ['Actor 4'],
    });
    movie3Id = movie3._id.toString();

    // Create test TV show
    const tvShow = await TVShow.create({
      title: 'Test TV Show',
      description: 'A test TV show description',
      genres: ['Drama', 'Fantasy'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2024-01-15'),
          director: 'Show Director',
          actors: ['TV Actor 1', 'TV Actor 2'],
        },
      ],
    });
    tvShowId = tvShow._id.toString();
  });

  // ============================================================================
  // POST /api/my-list - Add to List
  // ============================================================================
  describe('POST /api/my-list - Add to List', () => {
    describe('Success Cases', () => {
      it('should add a movie to empty list (201)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId, contentType: 'movie' });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          contentId: movieId,
          contentType: 'movie',
          title: 'Test Movie',
          genres: ['Action', 'SciFi'],
        });
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.addedAt).toBeDefined();
      });

      it('should add a TV show to list (201)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: tvShowId, contentType: 'tvshow' });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          contentId: tvShowId,
          contentType: 'tvshow',
          title: 'Test TV Show',
        });
      });

      it('should add multiple different items to list', async () => {
        await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId, contentType: 'movie' });

        await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: tvShowId, contentType: 'tvshow' });

        const listResponse = await request(app)
          .get('/api/my-list')
          .set('x-user-id', userId);

        expect(listResponse.body.data).toHaveLength(2);
      });
    });

    describe('Error Cases', () => {
      it('should reject duplicate movie (409 Conflict)', async () => {
        await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId, contentType: 'movie' });

        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId, contentType: 'movie' });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Item already exists in list');
      });

      it('should reject non-existent movie (404 Not Found)', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: fakeId, contentType: 'movie' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Movie not found');
      });

      it('should reject non-existent TV show (404 Not Found)', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: fakeId, contentType: 'tvshow' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('TV Show not found');
      });

      it('should reject invalid contentType (400 Bad Request)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId, contentType: 'podcast' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation error');
      });

      it('should reject missing x-user-id header (401 Unauthorized)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .send({ contentId: movieId, contentType: 'movie' });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should reject missing contentId (400 Bad Request)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentType: 'movie' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation error');
      });

      it('should reject missing contentType (400 Bad Request)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: movieId });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation error');
      });

      it('should reject invalid ObjectId format (400 Bad Request)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({ contentId: 'invalid-id', contentType: 'movie' });

        expect(response.status).toBe(400);
      });

      it('should reject empty body (400 Bad Request)', async () => {
        const response = await request(app)
          .post('/api/my-list')
          .set('x-user-id', userId)
          .send({});

        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================================================
  // DELETE /api/my-list/:contentId - Remove from List
  // ============================================================================
  describe('DELETE /api/my-list/:contentId - Remove from List', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: movieId, contentType: 'movie' });
    });

    describe('Success Cases', () => {
      it('should remove existing item (200)', async () => {
        const response = await request(app)
          .delete(`/api/my-list/${movieId}`)
          .set('x-user-id', userId);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Item removed from list');
      });

      it('should verify item is actually removed', async () => {
        await request(app)
          .delete(`/api/my-list/${movieId}`)
          .set('x-user-id', userId);

        const listResponse = await request(app)
          .get('/api/my-list')
          .set('x-user-id', userId);

        expect(listResponse.body.data).toHaveLength(0);
      });
    });

    describe('Error Cases', () => {
      it('should reject non-existent item (404 Not Found)', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
          .delete(`/api/my-list/${fakeId}`)
          .set('x-user-id', userId);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Item not in list');
      });

      it('should reject missing x-user-id (401 Unauthorized)', async () => {
        const response = await request(app)
          .delete(`/api/my-list/${movieId}`);

        expect(response.status).toBe(401);
      });

      it('should reject removing same item twice (404)', async () => {
        await request(app)
          .delete(`/api/my-list/${movieId}`)
          .set('x-user-id', userId);

        const response = await request(app)
          .delete(`/api/my-list/${movieId}`)
          .set('x-user-id', userId);

        expect(response.status).toBe(404);
      });
    });
  });

  // ============================================================================
  // GET /api/my-list - Offset Pagination
  // ============================================================================
  describe('GET /api/my-list - Offset Pagination', () => {
    beforeEach(async () => {
      await MyListItem.create([
        {
          user_id: userId,
          content_id: movieId,
          content_type: 'movie',
          added_at: new Date('2024-01-03'),
          title: 'Test Movie',
          description: 'A test movie',
          genres: ['Action'],
          release_date: new Date('2024-01-01'),
          director: 'Director',
          actors: ['Actor 1'],
        },
        {
          user_id: userId,
          content_id: movie2Id,
          content_type: 'movie',
          added_at: new Date('2024-01-02'),
          title: 'Test Movie 2',
          description: 'Another movie',
          genres: ['Comedy'],
          release_date: new Date('2024-02-01'),
          director: 'Director 2',
          actors: ['Actor 2'],
        },
        {
          user_id: userId,
          content_id: tvShowId,
          content_type: 'tvshow',
          added_at: new Date('2024-01-01'),
          title: 'Test TV Show',
          description: 'A TV show',
          genres: ['Drama'],
          release_date: new Date('2024-01-15'),
          director: 'Show Director',
          actors: ['TV Actor'],
        },
      ]);
    });

    it('should return empty array for new user', async () => {
      const newUserId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', newUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });

    it('should return items sorted by added_at DESC', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.body.data[0].title).toBe('Test Movie'); // Jan 3
      expect(response.body.data[1].title).toBe('Test Movie 2'); // Jan 2
      expect(response.body.data[2].title).toBe('Test TV Show'); // Jan 1
    });

    it('should default to offset pagination', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.body.pagination.type).toBe('offset');
    });

    it('should return correct pagination metadata', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.body.pagination).toMatchObject({
        type: 'offset',
        page: 1,
        limit: 10,
        totalItems: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should respect page and limit params', async () => {
      const response = await request(app)
        .get('/api/my-list?page=1&limit=2')
        .set('x-user-id', userId);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should return page 2 correctly', async () => {
      const response = await request(app)
        .get('/api/my-list?page=2&limit=2')
        .set('x-user-id', userId);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test TV Show');
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.hasPrevPage).toBe(true);
    });

    it('should return empty for page beyond data', async () => {
      const response = await request(app)
        .get('/api/my-list?page=10&limit=10')
        .set('x-user-id', userId);

      expect(response.body.data).toHaveLength(0);
    });

    it('should reject invalid page number', async () => {
      const response = await request(app)
        .get('/api/my-list?page=0')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
    });

    it('should reject limit > 100', async () => {
      const response = await request(app)
        .get('/api/my-list?limit=101')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // GET /api/my-list - Cursor Pagination
  // ============================================================================
  describe('GET /api/my-list - Cursor Pagination', () => {
    beforeEach(async () => {
      await MyListItem.create([
        {
          user_id: userId,
          content_id: movieId,
          content_type: 'movie',
          added_at: new Date('2024-01-03T10:00:00Z'),
          title: 'Test Movie',
          description: 'A test movie',
          genres: ['Action'],
          release_date: new Date('2024-01-01'),
          director: 'Director',
          actors: ['Actor 1'],
        },
        {
          user_id: userId,
          content_id: movie2Id,
          content_type: 'movie',
          added_at: new Date('2024-01-02T10:00:00Z'),
          title: 'Test Movie 2',
          description: 'Another movie',
          genres: ['Comedy'],
          release_date: new Date('2024-02-01'),
          director: 'Director 2',
          actors: ['Actor 2'],
        },
        {
          user_id: userId,
          content_id: tvShowId,
          content_type: 'tvshow',
          added_at: new Date('2024-01-01T10:00:00Z'),
          title: 'Test TV Show',
          description: 'A TV show',
          genres: ['Drama'],
          release_date: new Date('2024-01-15'),
          director: 'Show Director',
          actors: ['TV Actor'],
        },
      ]);
    });

    it('should return first page when cursor omitted', async () => {
      const response = await request(app)
        .get('/api/my-list?type=cursor&limit=2')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.type).toBe('cursor');
      expect(response.body.pagination.hasNextPage).toBe(true);
      expect(response.body.pagination.nextCursor).toBeTruthy();
      expect(response.body.pagination.prevCursor).toBeNull();
    });

    it('should return next page using cursor', async () => {
      const firstPage = await request(app)
        .get('/api/my-list?type=cursor&limit=2')
        .set('x-user-id', userId);

      const nextCursor = firstPage.body.pagination.nextCursor;

      const secondPage = await request(app)
        .get(`/api/my-list?type=cursor&limit=2&cursor=${nextCursor}`)
        .set('x-user-id', userId);

      expect(secondPage.body.data).toHaveLength(1);
      expect(secondPage.body.data[0].title).toBe('Test TV Show');
      expect(secondPage.body.pagination.hasNextPage).toBe(false);
      expect(secondPage.body.pagination.hasPrevPage).toBe(true);
    });

    it('should reject invalid cursor format', async () => {
      const response = await request(app)
        .get('/api/my-list?type=cursor&cursor=invalid-base64')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid cursor format');
    });

    it('should reject malformed base64 cursor', async () => {
      const malformed = Buffer.from('{"wrong":"data"}').toString('base64');

      const response = await request(app)
        .get(`/api/my-list?type=cursor&cursor=${malformed}`)
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
    });

    it('should return empty for new user with cursor pagination', async () => {
      const newUserId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get('/api/my-list?type=cursor&limit=10')
        .set('x-user-id', newUserId);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.nextCursor).toBeNull();
    });

    it('should walk through all pages without duplicates', async () => {
      const allItems: string[] = [];
      let nextCursor: string | null = null;

      // Get first page
      const firstPage = await request(app)
        .get('/api/my-list?type=cursor&limit=1')
        .set('x-user-id', userId);
      
      firstPage.body.data.forEach((item: { id: string }) => allItems.push(item.id));
      nextCursor = firstPage.body.pagination.nextCursor;

      // Get subsequent pages
      while (nextCursor) {
        const nextPage = await request(app)
          .get(`/api/my-list?type=cursor&limit=1&cursor=${nextCursor}`)
          .set('x-user-id', userId);

        nextPage.body.data.forEach((item: { id: string }) => allItems.push(item.id));
        nextCursor = nextPage.body.pagination.nextCursor;
      }

      // Should have 3 unique items
      expect(allItems).toHaveLength(3);
      expect(new Set(allItems).size).toBe(3); // No duplicates
    });
  });

  // ============================================================================
  // Cache Behavior
  // ============================================================================
  describe('Cache Behavior', () => {
    it('should return X-Cache: MISS on first request', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.headers['x-cache']).toBe('MISS');
    });

    it('should return X-Cache: HIT on second request', async () => {
      await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.headers['x-cache']).toBe('HIT');
    });

    it('should return MISS for different params', async () => {
      await request(app)
        .get('/api/my-list?limit=5')
        .set('x-user-id', userId);

      const response = await request(app)
        .get('/api/my-list?limit=10')
        .set('x-user-id', userId);

      expect(response.headers['x-cache']).toBe('MISS');
    });

    it('should invalidate cache after adding item', async () => {
      // First request - MISS
      await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      // Second request - HIT
      const cached = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(cached.headers['x-cache']).toBe('HIT');

      // Add item - invalidates cache
      await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: movieId, contentType: 'movie' });

      // Third request - MISS (cache invalidated)
      const afterAdd = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(afterAdd.headers['x-cache']).toBe('MISS');
      expect(afterAdd.body.data).toHaveLength(1);
    });

    it('should invalidate cache after removing item', async () => {
      // Add item first
      await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: movieId, contentType: 'movie' });

      // Cache the list
      await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      // Verify cached
      const cached = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(cached.headers['x-cache']).toBe('HIT');

      // Remove item
      await request(app)
        .delete(`/api/my-list/${movieId}`)
        .set('x-user-id', userId);

      // Verify cache invalidated
      const afterRemove = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(afterRemove.headers['x-cache']).toBe('MISS');
      expect(afterRemove.body.data).toHaveLength(0);
    });
  });

  // ============================================================================
  // Response Headers
  // ============================================================================
  describe('Response Headers', () => {
    it('should include X-Request-ID header', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should include X-Response-Time header', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Cache header', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.headers['x-cache']).toMatch(/^(HIT|MISS)$/);
    });
  });

  // ============================================================================
  // Health Check
  // ============================================================================
  describe('GET /api/health - Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is running');
    });
  });

  // ============================================================================
  // 404 Not Found
  // ============================================================================
  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .set('x-user-id', userId);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });

    it('should include route details in 404 response', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .set('x-user-id', userId);

      expect(response.status).toBe(404);
      expect(response.body.details[0]).toContain('POST /api/unknown');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle special characters in titles', async () => {
      const specialMovie = await Movie.create({
        title: "Movie: Special's & <Characters> \"Quotes\"",
        description: 'Special chars test',
        genres: ['Action'],
        releaseDate: new Date(),
        director: "O'Brien",
        actors: ['Actor & Co.'],
      });

      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: specialMovie._id.toString(), contentType: 'movie' });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe("Movie: Special's & <Characters> \"Quotes\"");
    });

    it('should handle unicode characters', async () => {
      const unicodeMovie = await Movie.create({
        title: 'Movie: 日本語 한국어 العربية 🎬',
        description: 'Unicode test',
        genres: ['Drama'],
        releaseDate: new Date(),
        director: 'Director',
        actors: ['Actor'],
      });

      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: unicodeMovie._id.toString(), contentType: 'movie' });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toContain('日本語');
    });

    it('should handle ObjectId-like user ID', async () => {
      // Use valid ObjectId format (24 hex chars)
      const validUserId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', validUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should isolate data between users', async () => {
      const user2 = await User.create({
        username: 'testuser2',
        preferences: { favoriteGenres: [], dislikedGenres: [] },
        watchHistory: [],
      });

      // Add item to user1
      await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: movieId, contentType: 'movie' });

      // User2 should have empty list
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', user2._id.toString());

      expect(response.body.data).toHaveLength(0);
    });
  });

  // ============================================================================
  // Cursor Pagination - Tie-breaker Test
  // ============================================================================
  describe('Cursor Pagination - Deterministic Ordering', () => {
    it('should handle items with same timestamp correctly', async () => {
      const sameTime = new Date('2024-01-01T12:00:00Z');

      // Create items with same timestamp
      await MyListItem.create([
        {
          user_id: userId,
          content_id: movieId,
          content_type: 'movie',
          added_at: sameTime,
          title: 'Movie A',
          description: 'A',
          genres: ['Action'],
          release_date: new Date(),
          director: 'D',
          actors: ['A'],
        },
        {
          user_id: userId,
          content_id: movie2Id,
          content_type: 'movie',
          added_at: sameTime,
          title: 'Movie B',
          description: 'B',
          genres: ['Action'],
          release_date: new Date(),
          director: 'D',
          actors: ['A'],
        },
        {
          user_id: userId,
          content_id: movie3Id,
          content_type: 'movie',
          added_at: sameTime,
          title: 'Movie C',
          description: 'C',
          genres: ['Action'],
          release_date: new Date(),
          director: 'D',
          actors: ['A'],
        },
      ]);

      // Walk through all pages
      const allItems: string[] = [];
      let nextCursor: string | null = null;

      // Get first page
      const firstPage = await request(app)
        .get('/api/my-list?type=cursor&limit=1')
        .set('x-user-id', userId);
      
      firstPage.body.data.forEach((item: { id: string }) => allItems.push(item.id));
      nextCursor = firstPage.body.pagination.nextCursor;

      // Get subsequent pages
      while (nextCursor) {
        const nextPage = await request(app)
          .get(`/api/my-list?type=cursor&limit=1&cursor=${nextCursor}`)
          .set('x-user-id', userId);

        nextPage.body.data.forEach((item: { id: string }) => allItems.push(item.id));
        nextCursor = nextPage.body.pagination.nextCursor;
      }

      // Should have exactly 3 unique items (no skips, no duplicates)
      expect(allItems).toHaveLength(3);
      expect(new Set(allItems).size).toBe(3);
    });
  });
});
