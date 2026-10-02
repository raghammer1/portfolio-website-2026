export type SampleMovie = {
  id: string;
  title: string;
  description: string;
  genres: readonly string[];
  keywords: readonly string[];
};

/** Small, hand-curated metadata set for the local interactive demonstration. */
export const movieCatalogue: readonly SampleMovie[] = [
  {
    id: 'interstellar',
    title: 'Interstellar',
    description: 'Space, time, and the pull of home.',
    genres: ['Science fiction', 'Drama', 'Adventure'],
    keywords: ['space', 'astronaut', 'family', 'time', 'gravity', 'wormhole', 'survival', 'earth'],
  },
  {
    id: 'the-martian',
    title: 'The Martian',
    description: 'Resourcefulness at the edge of survival.',
    genres: ['Science fiction', 'Adventure', 'Drama'],
    keywords: [
      'mars',
      'astronaut',
      'space',
      'survival',
      'science',
      'rescue',
      'isolation',
      'botany',
    ],
  },
  {
    id: 'arrival',
    title: 'Arrival',
    description: 'Language, memory, and an encounter with the unknown.',
    genres: ['Science fiction', 'Drama', 'Mystery'],
    keywords: [
      'alien',
      'language',
      'communication',
      'time',
      'earth',
      'first contact',
      'memory',
      'science',
    ],
  },
  {
    id: 'inception',
    title: 'Inception',
    description: 'Reality becomes a problem of perception.',
    genres: ['Science fiction', 'Action', 'Thriller'],
    keywords: ['dream', 'memory', 'mind', 'heist', 'perception', 'reality', 'time', 'family'],
  },
  {
    id: 'gravity',
    title: 'Gravity',
    description: 'Survival reduced to its simplest necessities.',
    genres: ['Science fiction', 'Thriller', 'Drama'],
    keywords: ['space', 'astronaut', 'survival', 'orbit', 'isolation', 'debris', 'rescue', 'earth'],
  },
  {
    id: 'apollo-13',
    title: 'Apollo 13',
    description: 'Engineering under pressure, far from home.',
    genres: ['Drama', 'Adventure', 'History'],
    keywords: [
      'space',
      'astronaut',
      'mission',
      'rescue',
      'survival',
      'engineering',
      'moon',
      'earth',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Listening for a signal beyond the familiar.',
    genres: ['Science fiction', 'Drama', 'Mystery'],
    keywords: [
      'alien',
      'signal',
      'science',
      'communication',
      'space',
      'first contact',
      'belief',
      'earth',
    ],
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    description: 'Identity in a world built to imitate life.',
    genres: ['Science fiction', 'Thriller', 'Mystery'],
    keywords: [
      'android',
      'identity',
      'memory',
      'future',
      'investigation',
      'human',
      'city',
      'reality',
    ],
  },
  {
    id: '2001-space-odyssey',
    title: '2001: A Space Odyssey',
    description: 'A long view of intelligence and exploration.',
    genres: ['Science fiction', 'Adventure', 'Mystery'],
    keywords: [
      'space',
      'astronaut',
      'artificial intelligence',
      'evolution',
      'mission',
      'alien',
      'future',
      'orbit',
    ],
  },
  {
    id: 'moon',
    title: 'Moon',
    description: 'Isolation turns routine into a question of identity.',
    genres: ['Science fiction', 'Drama', 'Mystery'],
    keywords: [
      'moon',
      'astronaut',
      'isolation',
      'identity',
      'memory',
      'mission',
      'human',
      'science',
    ],
  },
];
