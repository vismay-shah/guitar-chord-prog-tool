// GuitarChordDiagram.tsx
import React from 'react';
import type { Fingering } from './types';

interface GuitarChordDiagramProps {
  fingering: Fingering;
}

export const GuitarChordDiagram: React.FC<GuitarChordDiagramProps> = ({ fingering }) => {
  const { frets } = fingering;

  // Layout Constants
  const width = 100;
  const height = 110;
  const topY = 20;          // Nut position
  const bottomY = 100;      // Fretboard end
  const startX = 15;        // String 6 (E)
  const stringSpacing = 14; // Horizontal gap between strings
  const fretSpacing = 16;   // Vertical gap between frets

  // Calculate coordinates
  const stringsCount = 6;
  const fretsCount = 5;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="mx-auto max-h-[140px] max-w-[120px]">
      {/* 1. Draw Frets (Horizontal lines) */}
      {Array.from({ length: fretsCount + 1 }).map((_, i) => {
        const y = topY + i * fretSpacing;
        const isNut = i === 0;
        return (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={y}
            x2={startX + (stringsCount - 1) * stringSpacing}
            y2={y}
            stroke="black"
            strokeWidth={isNut ? 3 : 1} // Bold nut
          />
        );
      })}

      {/* 2. Draw Strings (Vertical lines) */}
      {Array.from({ length: stringsCount }).map((_, i) => {
        const x = startX + i * stringSpacing;
        return (
          <line
            key={`string-${i}`}
            x1={x}
            y1={topY}
            x2={x}
            y2={bottomY}
            stroke="#4b5563" // Charcoal gray string
            strokeWidth={1 + (6 - i) * 0.25} // Gradually thicker bass strings
          />
        );
      })}

      {/* 3. Draw Markers: Open ("o"), Muted ("x") and Fretted Notes */}
      {frets.map((fret, stringIdx) => {
        const x = startX + stringIdx * stringSpacing;

        // Case A: Muted string (x)
        if (fret === -1) {
          return (
            <g key={`marker-${stringIdx}`}>
              <line x1={x - 3} y1={topY - 11} x2={x + 3} y2={topY - 5} stroke="#ef4444" strokeWidth={1.5} />
              <line x1={x + 3} y1={topY - 11} x2={x - 3} y2={topY - 5} stroke="#ef4444" strokeWidth={1.5} />
            </g>
          );
        }

        // Case B: Open string (o)
        if (fret === 0) {
          return (
            <circle
              key={`marker-${stringIdx}`}
              cx={x}
              cy={topY - 8}
              r={3}
              fill="none"
              stroke="#10b981" // Green for open/ringing string
              strokeWidth={1.5}
            />
          );
        }

        // Case C: Active fretted note (Circle on fretboard)
        const fretY = topY + (fret - 0.5) * fretSpacing;

        return (
          <g key={`marker-${stringIdx}`}>
            <circle
              cx={x}
              cy={fretY}
              r={5.5}
              fill="#1f2937" // Dark slate fret dot
            />
          </g>
        );
      })}
    </svg>
  );
};