export type ChordName = 'C' | 'Dm' | 'Em' | 'F' | 'G' | 'Am';
export type MeasureSlot = ChordName | 'rest';

export const CHORDS: Record<ChordName, string[]> = {
   C: ['C3', 'E3', 'G3'],
   Dm: ['D3', 'F3', 'A3'],
   Em: ['E3', 'G3', 'B3'],
   F: ['F3', 'A3', 'C4'],
   G: ['G3', 'B3', 'D4'],
   Am: ['A3', 'C4', 'E4'],
};

export const SLOT_OPTIONS: MeasureSlot[] = [...(Object.keys(CHORDS) as ChordName[]), 'rest'];