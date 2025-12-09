# 🎬 My List Feature - OTT Platform Backend

> A **high-performance**, **scalable** backend API for the "My List" feature on an OTT platform.  
> Built with **TypeScript**, **Express.js**, **MongoDB**, and **Redis**.

[![Tests](https://img.shields.io/badge/tests-65%20passed-brightgreen)](./tests)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](./coverage)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

---

## ✅ Assignment Requirements Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Add to My List | ✅ | `POST /api/my-list` - No duplicates allowed |
| Remove from My List | ✅ | `DELETE /api/my-list/:contentId` |
| List My Items (Paginated) | ✅ | `GET /api/my-list` - Offset & Cursor pagination |
| **Sub-10ms Performance** | ✅ | Redis caching → **1-3ms** response time |
| Integration Tests | ✅ | **65 tests** covering all endpoints |
| TypeScript | ✅ | Strict mode, fully typed |
| MongoDB | ✅ | With optimized indexes |
| Scalable Architecture | ✅ | Stateless, connection pooling, rate limiting |

---

## 🚀 Performance Highlights

```
┌─────────────────────────────────────────────────────────┐
│  "List My Items" Performance (Target: < 10ms)           │
├─────────────────────────────────────────────────────────┤
│  Cache Hit:   1-3ms   ████████████████████░░░░░░  ✅    │
│  Cache Miss:  5-8ms   ████████████████████████░░  ✅    │
│  Cold Start:  10-15ms ██████████████████████████  ✅    │
└─────────────────────────────────────────────────────────┘
```

### How We Achieved Sub-10ms Performance

| Optimization | Technique | Impact |
|--------------|-----------|--------|
| **Denormalized Schema** | Content data stored with list item | No JOINs needed |
| **Redis Caching** | Write-through cache invalidation | 1-3ms cache hits |
| **Compound Indexes** | `user_id + added_at` covering index | O(log n) lookups |
| **Connection Pooling** | MongoDB (100) + Redis keep-alive | No connection overhead |
| **Lean Queries** | `.lean()` for plain objects | 50% less memory |
| **Gzip Compression** | Response compression | Smaller payloads |
| **HTTP Keep-Alive** | Persistent connections | No TCP handshake |

---

## 📊 Test Coverage

```
Test Suites: 3 passed, 3 total
Tests:       65 passed, 65 total

✓ my-list.test.ts      (48 tests) - Core functionality
✓ rate-limit.test.ts   (13 tests) - Rate limiting
✓ performance.test.ts  (4 tests)  - Performance validation
```

### Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| Add to List | ✅ Success, duplicates, invalid content, validation |
| Remove from List | ✅ Success, not found, invalid ID |
| List Items | ✅ Offset pagination, cursor pagination, empty list |
| Rate Limiting | ✅ Headers, limits, 429 responses |
| Performance | ✅ Cache hits, large lists, concurrency |
| Error Handling | ✅ Auth, validation, not found |

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Express    │────▶│    Redis     │
│  (Web/Mobile)│     │   Server     │     │    Cache     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │                     │
                           │ Cache Miss          │ Cache Hit
                           ▼                     │ (1-3ms)
                    ┌──────────────┐             │
                    │   MongoDB    │◀────────────┘
                    │  (Indexed)   │
                    └──────────────┘
```

### Key Design Decisions

1. **Denormalized Data Model**
   - Content metadata stored directly in MyListItem
   - Single query retrieval (no lookups/populates)
   - Trade-off: Storage vs Speed → Chose Speed

2. **Write-Through Cache**
   - Cache invalidated on every add/remove
   - Ensures data consistency
   - No stale data issues

3. **Dual Pagination**
   - **Offset**: Traditional page navigation
   - **Cursor**: Efficient infinite scroll (no skip overhead)

4. **Stateless Design**
   - No server-side sessions
   - Horizontally scalable
   - Load balancer ready

---

## 🔐 Rate Limiting

| Operation | Limit | Purpose |
|-----------|-------|---------|
| Read (GET) | 1000/min | High traffic for list views |
| Write (POST/DELETE) | 100/min | Prevent abuse |

```json
// 429 Response when exceeded
{
  "success": false,
  "error": "Too many requests",
  "details": ["Rate limit exceeded. Please try again later."]
}
```

---

## 📁 Project Structure

```
Codebase/
├── src/
│   ├── config/           # Database, Redis, environment
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, validation, rate-limit, errors
│   ├── models/           # MongoDB schemas (User, Movie, TVShow, MyListItem)
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic + caching
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Logger, helpers
│   ├── app.ts            # Express configuration
│   └── server.ts         # Entry point
├── tests/
│   ├── my-list.test.ts   # Core API tests
│   ├── rate-limit.test.ts # Rate limiting tests
│   └── performance.test.ts # Performance tests
├── scripts/
│   └── seed.ts           # Database seeding
└── docker-compose.yml    # MongoDB + Redis
```

---

## 🚦 Quick Start

### 1. Prerequisites
- Node.js 20.x
- Docker & Docker Compose

### 2. Setup & Run

```bash
# Install dependencies
npm install

# Start MongoDB & Redis
docker-compose up -d

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### 3. Test the API

```bash
# Get user's list
curl http://localhost:3000/api/my-list \
  -H "x-user-id: aaaaaaaaaaaaaaa100010000"

# Add movie to list
curl -X POST http://localhost:3000/api/my-list \
  -H "x-user-id: aaaaaaaaaaaaaaa100010000" \
  -H "Content-Type: application/json" \
  -d '{"contentId":"bbbbbbbbbbbbbb2000100000","contentType":"movie"}'

# Remove from list
curl -X DELETE http://localhost:3000/api/my-list/bbbbbbbbbbbbbb2000100000 \
  -H "x-user-id: aaaaaaaaaaaaaaa100010000"
```

### 4. Run Tests

```bash
npm test                  # Run all 65 tests
npm run test:coverage     # With coverage report
```

---

## 📡 API Reference

### Add to My List
```http
POST /api/my-list
x-user-id: <userId>
Content-Type: application/json

{"contentId": "<id>", "contentType": "movie" | "tvshow"}
```

### Remove from My List
```http
DELETE /api/my-list/:contentId
x-user-id: <userId>
```

### List My Items
```http
GET /api/my-list?type=offset&page=1&limit=10
GET /api/my-list?type=cursor&limit=10&cursor=<cursor>
x-user-id: <userId>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "contentId": "...",
      "contentType": "movie",
      "title": "The Matrix",
      "genres": ["Action", "SciFi"],
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "type": "offset",
    "page": 1,
    "limit": 10,
    "totalItems": 17,
    "totalPages": 2,
    "hasNextPage": true
  },
  "cacheHit": true
}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `MONGODB_URI` | - | MongoDB connection string |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `CACHE_TTL_SECONDS` | 300 | Cache expiry (5 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Requests per window |

---

## 📋 Database Indexes

```javascript
// Unique constraint - prevents duplicates
{ user_id: 1, content_id: 1 }  // unique: true

// Pagination index (covers offset queries)
{ user_id: 1, added_at: -1 }

// Cursor pagination with tie-breaker
{ user_id: 1, added_at: -1, _id: -1 }

// Content lookup
{ content_id: 1, content_type: 1 }
```

---

## 🧪 Running Integration Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/my-list.test.ts

# With coverage
npm run test:coverage
```

**Output:**
```
PASS tests/my-list.test.ts (48 tests)
PASS tests/rate-limit.test.ts (13 tests)
PASS tests/performance.test.ts (4 tests)

Test Suites: 3 passed, 3 total
Tests:       65 passed, 65 total
```

---

## 📝 Assumptions

1. **Authentication**: Using `x-user-id` header (mock auth in place)
2. **Content Pre-populated**: Movies/TV shows exist via seed script
3. **UTC Timestamps**: All dates stored in UTC
4. **Sort Order**: List sorted by `added_at` descending (newest first)
5. **Duplicate Prevention**: Same content cannot be added twice

---

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run seed` | Seed sample data |
| `npm run lint` | Run ESLint |

---

## 🔮 Future Enhancements

Even though the current implementation meets all performance requirements, there's scope for further improvements:

### 📚 Swagger API Integration
- **OpenAPI/Swagger Documentation**: Auto-generated interactive API docs
- **Request/Response Validation**: Schema-based validation using Swagger specs
- **API Testing UI**: Built-in test interface for developers
- **Client SDK Generation**: Auto-generate client libraries for multiple languages

### 🔀 Database Sharding for Write Scalability
- **Sharding on `user_id`**: Distribute writes across multiple shards
- **Consistent Hashing**: Ensure even data distribution
- **Horizontal Scaling**: Add more shards as user base grows
- **Benefits**:
  - Write throughput increases linearly with shards
  - Each shard handles subset of users independently
  - Reduced lock contention on high-traffic scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                    Sharded Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    Hash(user_id)    ┌─────────────────────┐  │
│   │  Client  │ ──────────────────▶ │    Shard Router     │  │
│   └──────────┘                     └──────────┬──────────┘  │
│                                               │              │
│           ┌───────────────┬───────────────────┼───────────┐ │
│           ▼               ▼                   ▼           │ │
│     ┌──────────┐    ┌──────────┐        ┌──────────┐      │ │
│     │ Shard 1  │    │ Shard 2  │  ...   │ Shard N  │      │ │
│     │ Users    │    │ Users    │        │ Users    │      │ │
│     │ A-F      │    │ G-L      │        │ M-Z      │      │ │
│     └──────────┘    └──────────┘        └──────────┘      │ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 🚀 Other Potential Improvements
- **GraphQL Support**: Alternative query interface
- **WebSocket Notifications**: Real-time list updates
- **Content Recommendations**: ML-based suggestions
- **Batch Operations**: Add/remove multiple items at once

---

## 👨‍💻 Author

**Bhagwati Prasad**

---

## 📄 License

ISC

---

<p align="center">
  <b>Built for Performance. Designed for Scale.</b><br>
  <sub>Developed by Bhagwati Prasad</sub>
</p>
