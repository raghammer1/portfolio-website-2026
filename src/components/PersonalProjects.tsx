import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { links, personalProjects } from '../data/content';
import { ExternalLink } from './ExternalLink';
import { TransportPreview } from './TransportPreview';
import { MoviePreview } from './MoviePreview';
import './PersonalProjects.css';

// This preset was read from the author's live Sudoku project, rather than invented for the visual.
const preset = [
  0, 0, 0, 0, 0, 0, 3, 0, 0, 7, 9, 0, 0, 0, 6, 0, 5, 0, 4, 1, 0, 0, 8, 7, 0, 0, 0, 8, 0, 0, 0, 4, 0,
  0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 4, 0, 0, 5, 0, 0, 0, 0, 7, 9, 0, 0, 6, 8, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 6, 3, 0, 8, 2, 0, 0, 0, 9, 0, 0, 0, 0, 0,
];

function canPlace(board: number[], index: number, value: number) {
  const row = Math.floor(index / 9);
  const column = index % 9;
  for (let position = 0; position < 81; position++) {
    if (position === index || board[position] !== value) continue;
    const otherRow = Math.floor(position / 9);
    const otherColumn = position % 9;
    if (
      otherRow === row ||
      otherColumn === column ||
      (Math.floor(otherRow / 3) === Math.floor(row / 3) &&
        Math.floor(otherColumn / 3) === Math.floor(column / 3))
    )
      return false;
  }
  return true;
}

function solveSudoku(values: number[]) {
  const board = [...values];
  function search(): boolean {
    let next = -1;
    let candidates: number[] = [];
    for (let index = 0; index < 81; index++) {
      if (board[index]) continue;
      const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => canPlace(board, index, value));
      if (!options.length) return false;
      if (next === -1 || options.length < candidates.length) {
        next = index;
        candidates = options;
      }
      if (options.length === 1) break;
    }
    if (next === -1) return true;
    for (const value of candidates) {
      board[next] = value;
      if (search()) return true;
    }
    board[next] = 0;
    return false;
  }
  return search() ? board : null;
}

function SudokuPreview() {
  const instructionsId = useId();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [board, setBoard] = useState(preset);
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState('A puzzle from the live project. Your move.');
  const conflicts = board.map((value, index) => value !== 0 && !canPlace(board, index, value));
  const completed = board.every(Boolean) && !conflicts.some(Boolean);

  function updateCell(index: number, text: string) {
    if (preset[index]) return;
    const value = Number(text.replace(/[^1-9]/g, '').slice(-1));
    const next = board.map((current, position) => (position === index ? value : current));
    setBoard(next);
    if (value && !canPlace(next, index, value)) {
      setMessage('That number repeats in its row, column or box.');
    } else if (
      next.every(Boolean) &&
      next.every((current, position) => canPlace(next, position, current))
    ) {
      setMessage('Puzzle complete. Every row, column and box checks out.');
    } else {
      setMessage('Keep going. Use each number once per row, column and box.');
    }
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>, index: number) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -9,
      ArrowDown: 9,
    };
    const offset = moves[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const next = Math.max(0, Math.min(80, index + offset));
    setActive(next);
    inputs.current[next]?.focus();
  }

  function solve() {
    if (conflicts.some(Boolean)) {
      setMessage('Clear the conflicting entries first, or reset this puzzle.');
      return;
    }
    const solution = solveSudoku(board);
    if (!solution) {
      setMessage('These entries have no solution. Reset the puzzle to try again.');
      return;
    }
    setBoard(solution);
    setMessage('Solved with recursive backtracking. Reset to try it yourself.');
  }

  return (
    <div className="personal-work-preview">
      <div className="personal-work-preview-heading">
        <span>PLAYABLE PREVIEW</span>
        <span>01 / SUDOKU</span>
      </div>
      <p className="personal-work-preview-instructions" id={instructionsId}>
        Select a cell. Type 1–9. Use arrow keys to move.
      </p>
      <div
        className={`personal-work-board${completed ? ' is-complete' : ''}`}
        role="group"
        aria-label="Nine by nine Sudoku puzzle"
      >
        {board.map((value, index) => {
          const row = Math.floor(index / 9);
          const column = index % 9;
          const given = preset[index] !== 0;
          return (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              className={`personal-work-cell${given ? ' is-given' : ''}${conflicts[index] && !given ? ' has-conflict' : ''}${column === 2 || column === 5 ? ' box-right' : ''}${row === 2 || row === 5 ? ' box-bottom' : ''}`}
              type="text"
              inputMode="numeric"
              pattern="[1-9]"
              maxLength={1}
              autoComplete="off"
              spellCheck={false}
              aria-label={`Row ${row + 1}, column ${column + 1}${given ? ', given number' : ''}`}
              aria-describedby={instructionsId}
              aria-invalid={conflicts[index] && !given ? true : undefined}
              value={value || ''}
              readOnly={given}
              tabIndex={active === index ? 0 : -1}
              onFocus={(event) => {
                setActive(index);
                event.currentTarget.select();
              }}
              onChange={(event) => updateCell(index, event.target.value)}
              onKeyDown={(event) => navigate(event, index)}
            />
          );
        })}
      </div>
      <div className="personal-work-preview-controls">
        <button type="button" onClick={solve} disabled={completed}>
          Solve preview
        </button>
        <button
          type="button"
          onClick={() => {
            setBoard(preset);
            setMessage('Puzzle reset. Ready when you are.');
          }}
        >
          Reset
        </button>
      </div>
      <p className="personal-work-preview-status" role="status">
        {message}
      </p>
      <noscript>
        <style>{`.personal-work .personal-work-preview-controls, .personal-work .personal-work-preview-instructions, .personal-work .personal-work-preview-status { display: none; }`}</style>
        <p className="personal-work-preview-fallback">Open the full project to play Sudoku.</p>
      </noscript>
    </div>
  );
}

export function PersonalProjects() {
  const sudoku = personalProjects.find((project) => project.kind === 'sudoku')!;
  const interactiveProjects = personalProjects.filter((project) => project.kind !== 'sudoku');
  return (
    <section className="personal-work" id="projects" aria-labelledby="personal-work-heading">
      <div className="personal-work-shell">
        <header className="personal-work-header">
          <div>
            <p className="personal-work-eyebrow">SELF-DIRECTED / PROJECTS</p>
            <h2 id="personal-work-heading">
              Built out of
              <br />
              curiosity.
            </h2>
          </div>
          <ExternalLink className="personal-work-all" href={links.github}>
            All repositories
          </ExternalLink>
        </header>
        <article
          className="personal-work-feature"
          id="sudoku-preview"
          aria-labelledby="personal-work-sudoku-heading"
        >
          <div className="personal-work-feature-copy">
            <p className="personal-work-eyebrow">{sudoku.category}</p>
            <h3 id="personal-work-sudoku-heading">
              Sudoku Generator
              <br />
              &amp; Solver
            </h3>
            <p className="personal-work-description">{sudoku.description}</p>
            <p className="personal-work-technologies">{sudoku.technologies}</p>
            <div className="personal-work-actions">
              {sudoku.actions.map((action, index) => (
                <ExternalLink
                  className={index === 0 ? 'personal-work-cta' : 'personal-work-source'}
                  key={action.url}
                  href={action.url}
                >
                  {action.label}
                </ExternalLink>
              ))}
            </div>
          </div>
          <SudokuPreview />
        </article>
        {interactiveProjects.map((project) => (
          <article
            className={`personal-work-feature personal-work-interactive personal-work-feature-${project.kind}`}
            id={`${project.kind}-preview`}
            key={project.kind}
            aria-labelledby={`personal-work-${project.kind}-heading`}
          >
            <div className="personal-work-feature-copy">
              <p className="personal-work-eyebrow">{project.category}</p>
              <h3 id={`personal-work-${project.kind}-heading`}>{project.title}</h3>
              <p className="personal-work-description">{project.description}</p>
              <p className="personal-work-technologies">{project.technologies}</p>
              <div className="personal-work-actions">
                {project.actions.map((action) => (
                  <ExternalLink className="personal-work-cta" key={action.url} href={action.url}>
                    Explore the source
                  </ExternalLink>
                ))}
              </div>
            </div>
            <div className="project-live-demo">
              {project.kind === 'transport' ? <TransportPreview /> : <MoviePreview />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
