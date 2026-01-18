import { createContext } from 'react';
import type { AsciiCellMetrics } from './measure';

export const AsciiMetricsContext = createContext<AsciiCellMetrics | null>(null);
