export type ChordName = 'C' | 'D' | 'Dm' | 'Em' | 'F' | 'G' | 'Am';
export type MeasureSlot = ChordName | 'rest';

export const CHORDS: Record<ChordName, string[]> = {
   C: ['C3', 'E3', 'G3'],
   Dm: ['D3', 'F3', 'A3'],
   D: ['D3', 'A4', 'D4', 'F4'],
   Em: ['E3', 'G3', 'B3'],
   F: ['F3', 'A3', 'C4'],
   G: ['G3', 'B3', 'D4'],
   Am: ['A3', 'C4', 'E4'],
};
export interface Fingering {
  // Array representing frets for strings 1-6 [E, A, D, G, B, e]
  // -1 = muted, 0 = open, >0 = fretted
  frets: number[];
}

export const CHORD_FINGERINGS: Record<ChordName, Fingering> = {
  C: {
    frets: [-1, 3, 2, 0, 1, 0],
  },
  Dm: {
    frets: [-1, -1, 0, 2, 3, 1],
  },
  D: {
    frets: [-1, -1, 0, 2, 3, 2],
  },
  Em: {
    frets: [0, 2, 2, 0, 0, 0],
  },
  F: {
    frets: [1, 3, 3, 2, 1, 1],
  },
  G: {
    frets: [3, 2, 0, 0, 0, 3],
  },
  Am: {
    frets: [-1, 0, 2, 2, 1, 0],
  }
};

export const SLOT_OPTIONS: MeasureSlot[] = [...(Object.keys(CHORDS) as ChordName[]), 'rest'];