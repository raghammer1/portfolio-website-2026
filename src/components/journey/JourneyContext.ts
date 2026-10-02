import { createContext, useContext } from 'react';
import type { JourneyId } from '../../data/journey';

type JourneyContextValue = {
  index: number | null;
  signals: Partial<Record<JourneyId, string>>;
  completed: readonly JourneyId[];
  start: () => void;
  goTo: (index: number) => void;
  exit: () => void;
  report: (id: JourneyId, message: string, discovered?: boolean) => void;
};

export const JourneyContext = createContext<JourneyContextValue>({
  index: null,
  signals: {},
  completed: [],
  start: () => {},
  goTo: () => {},
  exit: () => {},
  report: () => {},
});
export const useJourney = () => useContext(JourneyContext);
