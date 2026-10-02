import type { SampleMovie } from '../data/movieCatalogue';

export type MovieFeatureMode = 'genres-and-keywords' | 'genres';
export type MovieMatch = { movie: SampleMovie; score: number; matchedTerms: string[] };

// Match the source project's whitespace-compacted metadata tokens and raw term counts.
function tokens(label: string): string[] {
  return (
    label
      .toLowerCase()
      .replace(/\s+/g, '')
      .match(/[\p{L}\p{N}_]{2,}/gu) ?? []
  );
}

function labels(movie: SampleMovie, mode: MovieFeatureMode) {
  return mode === 'genres' ? movie.genres : [...movie.genres, ...movie.keywords];
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Raw-count TF × smooth IDF, then L2 normalization; all work stays in the browser. */
export function rankSimilarMovies(
  catalogue: readonly SampleMovie[],
  selectedId: string,
  mode: MovieFeatureMode = 'genres-and-keywords',
  limit = 3,
): MovieMatch[] {
  const selectedIndex = catalogue.findIndex((movie) => movie.id === selectedId);
  if (selectedIndex < 0 || limit <= 0) return [];

  const documents = catalogue.map((movie) => labels(movie, mode).flatMap(tokens));
  const documentFrequency = new Map<string, number>();
  for (const document of documents) {
    for (const term of new Set(document)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const vectors = documents.map((document) => {
    const vector = new Map<string, number>();
    for (const term of document) vector.set(term, (vector.get(term) ?? 0) + 1);
    let squaredLength = 0;
    for (const [term, count] of vector) {
      const idf = Math.log((1 + documents.length) / (1 + documentFrequency.get(term)!)) + 1;
      const weight = count * idf;
      vector.set(term, weight);
      squaredLength += weight * weight;
    }
    const length = Math.sqrt(squaredLength);
    if (length > 0) {
      for (const [term, weight] of vector) vector.set(term, weight / length);
    }
    return vector;
  });

  const selected = vectors[selectedIndex];
  const displayLabels = new Map<string, string>();
  for (const label of labels(catalogue[selectedIndex], mode)) {
    for (const term of tokens(label)) displayLabels.set(term, label.toLowerCase());
  }

  return catalogue
    .flatMap((movie, index): MovieMatch[] => {
      if (movie.id === selectedId) return [];
      const vector = vectors[index];
      const shared = [...selected.keys()].filter((term) => vector.has(term));
      const contribution = (term: string) => selected.get(term)! * vector.get(term)!;
      const score = shared.reduce((total, term) => total + contribution(term), 0);
      shared.sort((a, b) => contribution(b) - contribution(a) || compareText(a, b));
      return [
        {
          movie,
          score: Math.min(1, Math.max(0, score)),
          matchedTerms: shared.map((term) => displayLabels.get(term) ?? term),
        },
      ];
    })
    .sort((a, b) => b.score - a.score || compareText(a.movie.title, b.movie.title))
    .slice(0, Math.floor(limit));
}
