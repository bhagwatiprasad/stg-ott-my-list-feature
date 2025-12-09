/**
 * Database Seed Script
 * @author Bhagwati Prasad
 * @description Seeds sample users, movies, TV shows, and list items
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { User, Movie, TVShow, MyListItem } from '../src/models';
import type { Genre, ContentType } from '../src/types';

dotenv.config();

// Type for list item seed data
interface ListItemSeedData {
  user_id: string;
  content_id: string;
  content_type: ContentType;
  added_at: Date;
  title: string;
  description: string;
  genres: Genre[];
  release_date: Date;
  director: string;
  actors: string[];
}

// Fixed ObjectId generator - creates deterministic IDs based on prefix and index
const createFixedId = (prefix: string, index: number): mongoose.Types.ObjectId => {
  // Create a 24-character hex string (12 bytes) with prefix and padded index
  const paddedIndex = index.toString().padStart(4, '0');
  const hexString = `${prefix}${paddedIndex}`.padEnd(24, '0');
  return new mongoose.Types.ObjectId(hexString);
};

// Fixed ID prefixes (must be valid hex characters: 0-9, a-f)
const USER_PREFIX = 'aaaaaaaaaaaaaaa1';      // Users: aaaaaaaaaaaaaaa10001, etc.
const MOVIE_PREFIX = 'bbbbbbbbbbbbbb2';      // Movies: bbbbbbbbbbbbbb20001, etc.
const TVSHOW_PREFIX = 'cccccccccccccc3';     // TV Shows: cccccccccccccc30001, etc.

// Sample users data with fixed IDs
const usersData = [
  {
    _id: createFixedId(USER_PREFIX, 1),
    username: 'john_doe',
    preferences: {
      favoriteGenres: ['Action', 'SciFi'] as Genre[],
      dislikedGenres: ['Horror'] as Genre[],
    },
    watchHistory: [],
  },
  {
    _id: createFixedId(USER_PREFIX, 2),
    username: 'jane_smith',
    preferences: {
      favoriteGenres: ['Romance', 'Comedy'] as Genre[],
      dislikedGenres: ['Horror', 'Action'] as Genre[],
    },
    watchHistory: [],
  },
  {
    _id: createFixedId(USER_PREFIX, 3),
    username: 'bob_wilson',
    preferences: {
      favoriteGenres: ['Horror', 'Fantasy'] as Genre[],
      dislikedGenres: [] as Genre[],
    },
    watchHistory: [],
  },
  {
    _id: createFixedId(USER_PREFIX, 4),
    username: 'alice_jones',
    preferences: {
      favoriteGenres: ['Drama', 'Romance'] as Genre[],
      dislikedGenres: ['SciFi'] as Genre[],
    },
    watchHistory: [],
  },
  {
    _id: createFixedId(USER_PREFIX, 5),
    username: 'charlie_brown',
    preferences: {
      favoriteGenres: ['Comedy', 'Action'] as Genre[],
      dislikedGenres: ['Drama'] as Genre[],
    },
    watchHistory: [],
  },
];

// Sample movies data with fixed IDs
const moviesData = [
  {
    _id: createFixedId(MOVIE_PREFIX, 1),
    title: 'The Matrix',
    description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    genres: ['Action', 'SciFi'] as Genre[],
    releaseDate: new Date('1999-03-31'),
    director: 'Wachowskis',
    actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 2),
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',
    genres: ['Action', 'SciFi', 'Drama'] as Genre[],
    releaseDate: new Date('2010-07-16'),
    director: 'Christopher Nolan',
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 3),
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    genres: ['Drama'] as Genre[],
    releaseDate: new Date('1994-09-23'),
    director: 'Frank Darabont',
    actors: ['Tim Robbins', 'Morgan Freeman'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 4),
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must face one of the greatest tests.',
    genres: ['Action', 'Drama'] as Genre[],
    releaseDate: new Date('2008-07-18'),
    director: 'Christopher Nolan',
    actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 5),
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    genres: ['Drama', 'Action'] as Genre[],
    releaseDate: new Date('1994-10-14'),
    director: 'Quentin Tarantino',
    actors: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 6),
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War and other events unfold from the perspective of an Alabama man.',
    genres: ['Drama', 'Romance'] as Genre[],
    releaseDate: new Date('1994-07-06'),
    director: 'Robert Zemeckis',
    actors: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 7),
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
    genres: ['Drama', 'Action'] as Genre[],
    releaseDate: new Date('1972-03-24'),
    director: 'Francis Ford Coppola',
    actors: ['Marlon Brando', 'Al Pacino', 'James Caan'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 8),
    title: 'Fight Club',
    description: 'An insomniac office worker forms an underground fight club that evolves into something much more.',
    genres: ['Drama', 'Action'] as Genre[],
    releaseDate: new Date('1999-10-15'),
    director: 'David Fincher',
    actors: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 9),
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'A meek Hobbit and eight companions set out on a journey to destroy the One Ring.',
    genres: ['Fantasy', 'Action'] as Genre[],
    releaseDate: new Date('2001-12-19'),
    director: 'Peter Jackson',
    actors: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 10),
    title: 'Star Wars: Episode IV',
    description: 'Luke Skywalker joins forces with a Jedi Knight to save the galaxy from the Empire.',
    genres: ['SciFi', 'Action', 'Fantasy'] as Genre[],
    releaseDate: new Date('1977-05-25'),
    director: 'George Lucas',
    actors: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 11),
    title: 'The Silence of the Lambs',
    description: 'A young FBI cadet must receive the help of an incarcerated cannibal killer to catch another serial killer.',
    genres: ['Horror', 'Drama'] as Genre[],
    releaseDate: new Date('1991-02-14'),
    director: 'Jonathan Demme',
    actors: ['Jodie Foster', 'Anthony Hopkins'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 12),
    title: 'Goodfellas',
    description: 'The story of Henry Hill and his life in the mob from 1955 to 1980.',
    genres: ['Drama', 'Action'] as Genre[],
    releaseDate: new Date('1990-09-19'),
    director: 'Martin Scorsese',
    actors: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 13),
    title: 'The Notebook',
    description: 'A poor yet passionate young man falls in love with a rich young woman.',
    genres: ['Romance', 'Drama'] as Genre[],
    releaseDate: new Date('2004-06-25'),
    director: 'Nick Cassavetes',
    actors: ['Ryan Gosling', 'Rachel McAdams', 'James Garner'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 14),
    title: 'Titanic',
    description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the Titanic.',
    genres: ['Romance', 'Drama'] as Genre[],
    releaseDate: new Date('1997-12-19'),
    director: 'James Cameron',
    actors: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 15),
    title: 'The Hangover',
    description: 'Three buddies wake up with no memory of the previous night and must retrace their steps.',
    genres: ['Comedy'] as Genre[],
    releaseDate: new Date('2009-06-05'),
    director: 'Todd Phillips',
    actors: ['Bradley Cooper', 'Ed Helms', 'Zach Galifianakis'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 16),
    title: 'Superbad',
    description: 'Two co-dependent high school seniors try to score alcohol for a party.',
    genres: ['Comedy'] as Genre[],
    releaseDate: new Date('2007-08-17'),
    director: 'Greg Mottola',
    actors: ['Jonah Hill', 'Michael Cera', 'Christopher Mintz-Plasse'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 17),
    title: 'Get Out',
    description: 'A young African-American visits his white girlfriend\'s parents for the weekend.',
    genres: ['Horror', 'Drama'] as Genre[],
    releaseDate: new Date('2017-02-24'),
    director: 'Jordan Peele',
    actors: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 18),
    title: 'A Quiet Place',
    description: 'A family must live in silence to avoid mysterious creatures that hunt by sound.',
    genres: ['Horror', 'Drama'] as Genre[],
    releaseDate: new Date('2018-04-06'),
    director: 'John Krasinski',
    actors: ['Emily Blunt', 'John Krasinski', 'Millicent Simmonds'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 19),
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space to ensure humanity\'s survival.',
    genres: ['SciFi', 'Drama'] as Genre[],
    releaseDate: new Date('2014-11-07'),
    director: 'Christopher Nolan',
    actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
  },
  {
    _id: createFixedId(MOVIE_PREFIX, 20),
    title: 'Avatar',
    description: 'A paraplegic Marine is dispatched to the moon Pandora on a unique mission.',
    genres: ['SciFi', 'Action', 'Fantasy'] as Genre[],
    releaseDate: new Date('2009-12-18'),
    director: 'James Cameron',
    actors: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
  },
];

// Sample TV shows data with fixed IDs
const tvShowsData = [
  {
    _id: createFixedId(TVSHOW_PREFIX, 1),
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine.',
    genres: ['Drama', 'Action'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2008-01-20'), director: 'Vince Gilligan', actors: ['Bryan Cranston', 'Aaron Paul'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2008-01-27'), director: 'Vince Gilligan', actors: ['Bryan Cranston', 'Aaron Paul'] },
      { episodeNumber: 3, seasonNumber: 1, releaseDate: new Date('2008-02-03'), director: 'Vince Gilligan', actors: ['Bryan Cranston', 'Aaron Paul'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 2),
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros.',
    genres: ['Fantasy', 'Drama', 'Action'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2011-04-17'), director: 'Tim Van Patten', actors: ['Emilia Clarke', 'Kit Harington'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2011-04-24'), director: 'Tim Van Patten', actors: ['Emilia Clarke', 'Kit Harington'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 3),
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother and friends must confront terrifying supernatural forces.',
    genres: ['SciFi', 'Horror', 'Drama'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2016-07-15'), director: 'Duffer Brothers', actors: ['Millie Bobby Brown', 'Finn Wolfhard'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2016-07-15'), director: 'Duffer Brothers', actors: ['Millie Bobby Brown', 'Finn Wolfhard'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 4),
    title: 'The Office',
    description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes.',
    genres: ['Comedy'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2005-03-24'), director: 'Greg Daniels', actors: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2005-03-29'), director: 'Greg Daniels', actors: ['Steve Carell', 'Rainn Wilson'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 5),
    title: 'Friends',
    description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends.',
    genres: ['Comedy', 'Romance'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('1994-09-22'), director: 'James Burrows', actors: ['Jennifer Aniston', 'Courteney Cox', 'Matt LeBlanc'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('1994-09-29'), director: 'James Burrows', actors: ['Jennifer Aniston', 'Courteney Cox'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 6),
    title: 'The Crown',
    description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign.',
    genres: ['Drama'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2016-11-04'), director: 'Stephen Daldry', actors: ['Claire Foy', 'Matt Smith'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2016-11-04'), director: 'Stephen Daldry', actors: ['Claire Foy', 'Matt Smith'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 7),
    title: 'The Mandalorian',
    description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
    genres: ['SciFi', 'Action', 'Fantasy'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2019-11-12'), director: 'Dave Filoni', actors: ['Pedro Pascal', 'Carl Weathers'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2019-11-15'), director: 'Rick Famuyiwa', actors: ['Pedro Pascal'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 8),
    title: 'Black Mirror',
    description: 'An anthology series exploring a twisted, high-tech multiverse.',
    genres: ['SciFi', 'Drama', 'Horror'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2011-12-04'), director: 'Charlie Brooker', actors: ['Rory Kinnear', 'Lindsay Duncan'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2011-12-11'), director: 'Euros Lyn', actors: ['Daniel Kaluuya'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 9),
    title: 'The Witcher',
    description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world.',
    genres: ['Fantasy', 'Action', 'Drama'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2019-12-20'), director: 'Alik Sakharov', actors: ['Henry Cavill', 'Anya Chalotra'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2019-12-20'), director: 'Alex Garcia Lopez', actors: ['Henry Cavill'] },
    ],
  },
  {
    _id: createFixedId(TVSHOW_PREFIX, 10),
    title: 'Money Heist',
    description: 'A criminal mastermind who goes by The Professor has a plan to pull off the biggest heist in history.',
    genres: ['Action', 'Drama'] as Genre[],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2017-05-02'), director: 'Alex Pina', actors: ['Úrsula Corberó', 'Álvaro Morte'] },
      { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2017-05-02'), director: 'Alex Pina', actors: ['Úrsula Corberó', 'Álvaro Morte'] },
    ],
  },
];

async function seed(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/mylist_db?authSource=admin';
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      TVShow.deleteMany({}),
      MyListItem.deleteMany({}),
    ]);

    // Seed users
    console.log('👤 Seeding users...');
    const users = await User.insertMany(usersData);
    console.log(`   Created ${users.length} users`);

    // Seed movies
    console.log('🎬 Seeding movies...');
    const movies = await Movie.insertMany(moviesData);
    console.log(`   Created ${movies.length} movies`);

    // Seed TV shows
    console.log('📺 Seeding TV shows...');
    const tvShows = await TVShow.insertMany(tvShowsData);
    console.log(`   Created ${tvShows.length} TV shows`);

    // Create sample list items for first user (15+ items for pagination testing)
    console.log('📋 Creating sample list items...');
    const sampleListItems: ListItemSeedData[] = [];
    
    // Add 12 movies to the list
    for (let i = 0; i < 12; i++) {
      sampleListItems.push({
        user_id: users[0]._id.toString(),
        content_id: movies[i]._id.toString(),
        content_type: 'movie' as const,
        added_at: new Date(Date.now() - i * 1000), // Staggered timestamps
        title: movies[i].title,
        description: movies[i].description,
        genres: movies[i].genres,
        release_date: movies[i].releaseDate,
        director: movies[i].director,
        actors: movies[i].actors,
      });
    }
    
    // Add 5 TV shows to the list
    for (let i = 0; i < 5; i++) {
      sampleListItems.push({
        user_id: users[0]._id.toString(),
        content_id: tvShows[i]._id.toString(),
        content_type: 'tvshow' as const,
        added_at: new Date(Date.now() - (12 + i) * 1000), // Continue staggered timestamps
        title: tvShows[i].title,
        description: tvShows[i].description,
        genres: tvShows[i].genres,
        release_date: tvShows[i].episodes[0].releaseDate,
        director: tvShows[i].episodes[0].director,
        actors: Array.from(new Set(tvShows[i].episodes.flatMap(ep => ep.actors))),
      });
    }
    
    await MyListItem.insertMany(sampleListItems);
    console.log(`   Created ${sampleListItems.length} list items for user: ${users[0].username}`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Movies: ${movies.length}`);
    console.log(`   TV Shows: ${tvShows.length}`);
    console.log(`   List Items: ${sampleListItems.length}`);
    
    console.log('\n🔑 Test User IDs:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username}: ${user._id.toString()}`);
    });

    console.log('\n🎬 Sample Movie IDs:');
    movies.slice(0, 5).forEach((movie, index) => {
      console.log(`   ${index + 1}. ${movie.title}: ${movie._id.toString()}`);
    });

    console.log('\n📺 Sample TV Show IDs:');
    tvShows.slice(0, 5).forEach((show, index) => {
      console.log(`   ${index + 1}. ${show.title}: ${show._id.toString()}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

void seed();

