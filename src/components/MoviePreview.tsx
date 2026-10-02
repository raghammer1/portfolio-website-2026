import { useId, useMemo, useState } from 'react';
import { movieCatalogue } from '../data/movieCatalogue';
import { rankSimilarMovies } from '../lib/movieSimilarity';
import type { MovieFeatureMode } from '../lib/movieSimilarity';
import './MoviePreview.css';

export function MoviePreview() {
  const selectorId = useId();
  const [selectedId, setSelectedId] = useState(movieCatalogue[0].id);
  const [mode, setMode] = useState<MovieFeatureMode>('genres-and-keywords');
  const selected = movieCatalogue.find((movie) => movie.id === selectedId)!;
  const matches = useMemo(
    () => rankSimilarMovies(movieCatalogue, selectedId, mode),
    [selectedId, mode],
  );

  return (
    <div className="movie-preview">
      <div className="movie-preview-heading">
        <span>INTERACTIVE PREVIEW</span>
        <span>03 / MOVIES</span>
      </div>
      <div className="movie-preview-controls">
        <label className="movie-preview-label" htmlFor={selectorId}>
          Sample catalogue
        </label>
        <div className="movie-preview-select-wrap">
          <select
            id={selectorId}
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {movieCatalogue.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="movie-preview-selected">
        <p className="movie-preview-description">{selected.description}</p>
        <p className="movie-preview-genres">{selected.genres.join(' · ')}</p>
      </div>
      <fieldset className="movie-preview-modes movie-preview-controls">
        <legend className="movie-preview-label">Compare using</legend>
        <button
          type="button"
          aria-pressed={mode === 'genres-and-keywords'}
          onClick={() => setMode('genres-and-keywords')}
        >
          Genres + keywords
        </button>
        <button type="button" aria-pressed={mode === 'genres'} onClick={() => setMode('genres')}>
          Genres only
        </button>
      </fieldset>
      <div className="movie-preview-results-heading">
        <span>CLOSEST MATCHES</span>
        <span>CONTENT SIMILARITY</span>
      </div>
      <ol className="movie-preview-results" aria-label="Similar films">
        {matches.map((match, index) => (
          <li className="movie-preview-result" key={match.movie.id}>
            <span className="movie-preview-rank" aria-hidden="true">
              0{index + 1}
            </span>
            <div className="movie-preview-result-copy">
              <h4>{match.movie.title}</h4>
              <p>Shared: {match.matchedTerms.slice(0, 3).join(' · ') || 'no matching terms'}</p>
            </div>
            <span
              className="movie-preview-score"
              aria-label={`${Math.round(match.score * 100)} percent content similarity`}
            >
              {Math.round(match.score * 100)}
              <small>%</small>
            </span>
          </li>
        ))}
      </ol>
      <p className="movie-preview-note">Small sample catalogue · runs locally</p>
      <p className="movie-preview-announcement" role="status">
        Top match for {selected.title}: {matches[0]?.movie.title ?? 'none'}. Comparing{' '}
        {mode === 'genres' ? 'genres only' : 'genres and keywords'}.
      </p>
      <noscript>
        <style>{`.movie-preview .movie-preview-controls { display: none; }`}</style>
        <p className="movie-preview-note">Sample matches for Interstellar.</p>
      </noscript>
    </div>
  );
}
