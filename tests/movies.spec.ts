import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { movieCatalogue } from '../src/data/movieCatalogue';
import type { SampleMovie } from '../src/data/movieCatalogue';
import { rankSimilarMovies } from '../src/lib/movieSimilarity';

test.use({ reducedMotion: 'reduce' });

const film = (
  id: string,
  title: string,
  genres: string[],
  keywords: string[] = [],
): SampleMovie => ({ id, title, genres, keywords, description: '' });

test('movie similarity uses smooth IDF and L2 cosine rather than plain overlap', () => {
  const fixture = [
    film('a', 'A', ['drama'], ['space']),
    film('b', 'B', ['drama'], ['ocean']),
    film('c', 'C', ['comedy'], ['music']),
  ];
  const matches = rankSimilarMovies(fixture, 'a');
  expect(matches.map((match) => match.movie.id)).toEqual(['b', 'c']);
  expect(matches[0].score).toBeCloseTo(0.366446816266513, 12);
  expect(matches[0].matchedTerms).toEqual(['drama']);
  expect(matches[1].score).toBe(0);
  expect(matches[1].matchedTerms).toEqual([]);
});

test('movie similarity preserves repeated term counts and normalizes multiword metadata', () => {
  const fixture = [
    film('a', 'A', ['Science fiction'], ['space', 'space']),
    film('b', 'B', ['ScienceFiction'], ['space']),
    film('c', 'C', ['comedy'], ['ocean']),
  ];
  const [match] = rankSimilarMovies(fixture, 'a');
  expect(match.movie.id).toBe('b');
  expect(match.score).toBeCloseTo(3 / Math.sqrt(10), 12);
  expect(match.matchedTerms).toEqual(['space', 'science fiction']);
});

test('movie similarity handles empty inputs, excludes the selected ID and breaks ties deterministically', () => {
  expect(rankSimilarMovies([], 'missing')).toEqual([]);
  expect(rankSimilarMovies([film('a', 'A', [])], 'missing')).toEqual([]);
  const empty = rankSimilarMovies(
    [film('a', 'A', []), film('b', 'B', []), film('c', 'C', ['drama'])],
    'a',
  );
  expect(empty.every((match) => Number.isFinite(match.score) && match.score === 0)).toBe(true);
  expect(empty.every((match) => match.matchedTerms.length === 0)).toBe(true);
  const tied = [
    film('b', 'Beta', ['drama']),
    film('selected', 'Selected', ['drama']),
    film('a', 'Alpha', ['drama']),
  ];
  expect(rankSimilarMovies(tied, 'selected').map((match) => match.movie.id)).toEqual(['a', 'b']);
  expect(rankSimilarMovies(tied, 'selected').every((match) => match.score === 1)).toBe(true);
});

test('changing a film recalculates ranks with finite scores and genuine shared terms', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.movie-preview');
  const selector = preview.getByRole('combobox', { name: 'Sample catalogue', exact: true });
  const results = preview.getByRole('listitem');
  await expect(results).toHaveCount(3);
  const before = await results.locator('h4').allTextContents();
  expect(before).not.toContain('Interstellar');

  await selector.selectOption('inception');
  await expect(preview.getByRole('status')).toContainText('Top match for Inception');
  const after = await results.locator('h4').allTextContents();
  expect(after).not.toEqual(before);
  expect(after).not.toContain('Inception');
  const selected = movieCatalogue.find((movie) => movie.id === 'inception')!;
  const normalize = (term: string) => term.toLowerCase().replace(/\s+/g, '');
  const selectedTerms = [...selected.genres, ...selected.keywords].map(normalize);
  for (const row of await results.all()) {
    const title = await row.locator('h4').innerText();
    const movie = movieCatalogue.find(
      (candidate) => candidate.title.toUpperCase() === title.toUpperCase(),
    )!;
    const candidateTerms = [...movie.genres, ...movie.keywords].map(normalize);
    const shared = (await row.locator('p').innerText()).replace(/^Shared: /, '').split(' · ');
    for (const term of shared) {
      expect(selectedTerms).toContain(normalize(term));
      expect(candidateTerms).toContain(normalize(term));
    }
    const score = Number.parseFloat(await row.locator('.movie-preview-score').innerText());
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  }
});

test('genre-only mode recalculates similarity from the chosen feature set', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('.movie-preview');
  const top = preview.getByRole('listitem').first();
  const previousScore = await top.locator('.movie-preview-score').innerText();
  const genres = preview.getByRole('button', { name: 'Genres only', exact: true });
  await genres.focus();
  await genres.press('Space');
  await expect(genres).toHaveAttribute('aria-pressed', 'true');
  await expect(top.locator('h4')).toHaveText('The Martian');
  await expect(top.locator('.movie-preview-score')).toHaveText('100%');
  expect(previousScore).not.toBe('100%');
  await expect(preview.getByRole('status')).toContainText('genres only');
});

test('movie selection supports keyboard input and the preview fits mobile and desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto('/');
  const preview = page.locator('.movie-preview');
  const selector = preview.getByRole('combobox', { name: 'Sample catalogue', exact: true });
  await selector.scrollIntoViewIfNeeded();
  await selector.focus();
  await expect(selector).toBeFocused();
  await selector.press('m');
  await selector.press('Enter');
  await expect(selector).toHaveValue('moon');
  await expect(preview.getByRole('status')).toContainText('Top match for Moon');
  await selector.selectOption('interstellar');
  await mkdir('test-results/screenshots', { recursive: true });
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await preview.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const bounds = await preview.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(await preview.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await preview.screenshot({
      path: `test-results/screenshots/movies-${width}.png`,
      animations: 'disabled',
      style: '.site-header, .skip-link { visibility: hidden !important; }',
    });
  }
});
