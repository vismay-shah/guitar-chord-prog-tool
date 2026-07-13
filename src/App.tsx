import { useEffect, useMemo, useState, useRef } from 'react'
import * as Tone from 'tone'

type ChordName = 'C' | 'Dm' | 'Em' | 'F' | 'G' | 'Am'
type MeasureSlot = ChordName | 'rest'

interface Measure {
   slots: MeasureSlot[]
}

const CHORDS: Record<ChordName, string[]> = {
   C: ['C3', 'E3', 'G3'],
   Dm: ['D3', 'F3', 'A3'],
   Em: ['E3', 'G3', 'B3'],
   F: ['F3', 'A3', 'C4'],
   G: ['G3', 'B3', 'D4'],
   Am: ['A3', 'C4', 'E4'],
}

const CHORD_OPTIONS = Object.keys(CHORDS) as ChordName[]
const SLOT_OPTIONS: MeasureSlot[] = [...CHORD_OPTIONS, 'rest']

const INITIAL_MEASURES: Measure[] = [
   { slots: ['C'] },
   { slots: ['F', 'G'] },
   { slots: ['Am', 'rest'] },
   { slots: ['C'] },
]

const formatMeasure = (measure: Measure) => measure.slots
   .map((slot) => slot === 'rest' ? 'Rest' : slot)
   .join(' / ')

const getSlotDuration = (measure: Measure) => measure.slots.length === 1 ? '1m' : '2n'

const ChordPlayer = ({
   chordSynth,
   metronomeSynth,
   bpm,
   measures,
}: {
   chordSynth: Tone.PolySynth;
   metronomeSynth: Tone.Synth;
   bpm: number;
   measures: Measure[];
}) => {
   const [isPlaying, setIsPlaying] = useState(false)
   const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false)

   // 1. Synchronized Metronome Loop
   const isMetronomeEnabledRef = useRef(isMetronomeEnabled)
   useEffect(() => {
      isMetronomeEnabledRef.current = isMetronomeEnabled
   }, [isMetronomeEnabled])
   // Synchronized Metronome Loop (Runs exactly once, perfectly on the grid)
   useEffect(() => {
      const metronomeRepeatId = Tone.Transport.scheduleRepeat((time) => {
         if (isMetronomeEnabledRef.current) {
            // C6 is a high woodblock-like click that cuts through the chords
            metronomeSynth.triggerAttackRelease('C6', '32n', time)
         }
      }, '4n');

      return () => {
         Tone.Transport.clear(metronomeRepeatId)
      }
   }, [metronomeSynth]); // No state dependencies!

   // 2. Chord Progression Timeline (Tone.Part)
   useEffect(() => {
      // Flatten the measures into a list of scheduled events for Tone.Part
      const events: { time: string; chords: string[]; duration: string }[] = []

      measures.forEach((measure, measureIndex) => {
         const duration = getSlotDuration(measure)
         
         measure.slots.forEach((slot, slotIndex) => {
            if (slot === 'rest') return
            
            // Construct a valid Tone.js timeline string: "measure:quarter:sixteenth"
            const timeString = slotIndex === 0 
               ? `${measureIndex}:0:0` 
               : `${measureIndex}:2:0` // '2n' is halfway through a 4/4 measure (2 quarters in)

            events.push({
               time: timeString,
               chords: CHORDS[slot],
               duration: duration
            })
         })
      })

      // Create the Part
      const progressionPart = new Tone.Part((time, value) => {
         chordSynth.triggerAttackRelease(value.chords, value.duration, time)
      }, events)

      // Configure loop parameters on the part itself
      progressionPart.loop = true
      progressionPart.loopEnd = `${measures.length}m`
      progressionPart.start(0)

      return () => {
         progressionPart.dispose()
      }
   }, [chordSynth, measures]);

   // 3. Keep BPM in sync
   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
   }, [bpm]);

   const handlePlaybackToggle = async () => {
      await Tone.start()
      if (isPlaying) {
         Tone.Transport.stop();
         Tone.Transport.position = 0; // Reset timeline to the beginning
         setIsPlaying(false);
         return;
      }
      Tone.Transport.start();
      setIsPlaying(true);
   }

   return (
      <div className="flex w-full max-w-5xl flex-col items-center gap-4">
         <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Chord Progression Player</h1>
            <p className="text-sm text-gray-600">Play four measures, with each measure holding one full-measure chord or two half-measure slots.</p>
         </div>
         <div className="flex flex-wrap items-center justify-center gap-3">
            <button
               className={`rounded-lg px-4 py-2 font-semibold text-white shadow-md transition ${
                  isPlaying
                     ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                     : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
               }`}
               onClick={handlePlaybackToggle}>
               {isPlaying ? 'Stop progression' : 'Start progression'}
            </button>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
               <input
                  type="checkbox"
                  checked={isMetronomeEnabled}
                  onChange={(event) => setIsMetronomeEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-blue-600"
               />
               Metronome
            </label>
         </div>
      </div>
   );
}

interface ProgressionEditorProps {
   measures: Measure[];
   setMeasures: (measures: Measure[]) => void;
}

const ProgressionEditor = ({ measures, setMeasures }: ProgressionEditorProps) => {
   const updateMeasureSplit = (measureIndex: number, isSplit: boolean) => {
      setMeasures(measures.map((measure, index) => {
         if (index !== measureIndex) return measure

         return {
            slots: isSplit
               ? [measure.slots[0] ?? 'C', measure.slots[1] ?? 'rest']
               : [measure.slots.find((slot) => slot !== 'rest') ?? 'C'],
         }
      }))
   }

   const updateMeasureSlot = (measureIndex: number, slotIndex: number, value: MeasureSlot) => {
      setMeasures(measures.map((measure, index) => {
         if (index !== measureIndex) return measure

         const nextSlots = [...measure.slots]
         nextSlots[slotIndex] = value
         return { slots: nextSlots }
      }))
   }

   return (
      <section className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
         {measures.map((measure, measureIndex) => {
            const isSplit = measure.slots.length === 2

            return (
               <div key={measureIndex} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                     <div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Measure {measureIndex + 1}</h2>
                        <p className="text-lg font-semibold text-gray-900">{formatMeasure(measure)}</p>
                     </div>
                     <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                           type="checkbox"
                           checked={isSplit}
                           onChange={(event) => updateMeasureSplit(measureIndex, event.target.checked)}
                           className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                        />
                        Split
                     </label>
                  </div>
                  <div className="grid gap-3">
                     {measure.slots.map((slot, slotIndex) => (
                        <label key={slotIndex} className="grid gap-1 text-sm font-medium text-gray-700">
                           <span>{isSplit ? `Half ${slotIndex + 1}` : 'Full measure'}</span>
                           <select
                              value={slot}
                              onChange={(event) => updateMeasureSlot(measureIndex, slotIndex, event.target.value as MeasureSlot)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                           >
                              {SLOT_OPTIONS.map((option) => (
                                 <option key={option} value={option}>
                                    {option === 'rest' ? 'Rest' : option}
                                 </option>
                              ))}
                           </select>
                        </label>
                     ))}
                  </div>
               </div>
            )
         })}
      </section>
   )
}

interface BpmSliderProps {
   bpm: number;
   setBpm: (value: number) => void;
}

const BpmSlider = ({ bpm, setBpm }: BpmSliderProps) => {
   const MIN_BPM = 40;
   const MAX_BPM = 200;
   const [inputValue, setInputValue] = useState(bpm.toString());

   const handleSliderChange = (val: string) => {
      const num = Number(val);
      setBpm(num);
      setInputValue(val);
   };

   const handleInputChange = (val: string) => {
      setInputValue(val);
      const num = Number(val);
      if (!isNaN(num) && num >= MIN_BPM && num <= MAX_BPM) {
         setBpm(num);
      }
   };

   const handleInputBlur = () => {
      const num = Number(inputValue);
      if (isNaN(num) || num < MIN_BPM) {
         setBpm(MIN_BPM);
         setInputValue(MIN_BPM.toString());
      } else if (num > MAX_BPM) {
         setBpm(MAX_BPM);
         setInputValue(MAX_BPM.toString());
      } else {
         setInputValue(num.toString());
      }
   };

   return (
      <div className="flex w-full max-w-5xl flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
         <div className="flex flex-wrap items-center justify-center gap-4">
            <label className="text-sm font-medium text-gray-700">BPM</label>
            <input
               type="range"
               min={MIN_BPM}
               max={MAX_BPM}
               value={bpm}
               onChange={(e) => handleSliderChange(e.target.value)}
               className="h-2 w-56 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
            <input
               type="number"
               value={inputValue}
               onChange={(e) => handleInputChange(e.target.value)}
               onBlur={handleInputBlur}
               className="w-20 rounded border border-gray-300 p-1 text-center text-sm font-semibold"
            />
         </div>
      </div>
   );
}

function App() {
   const metronomeSynth = useMemo(() => new Tone.Synth({
         oscillator: { type: 'sine' },
         envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination(),
      [],
   );

   const chordSynth = useMemo(() => {
      const synth = new Tone.PolySynth(Tone.Synth, {
         oscillator: { type: 'fatsawtooth' },
         envelope: { attack: 0.02, decay: 0.85, sustain: 0.15, release: 0.4 }
      }).toDestination();
      
      synth.volume.value = -12; // Lower chord volume so you can hear the click!
      return synth;
   }, []);

   const [bpm, setBpm] = useState(100);
   const [measures, setMeasures] = useState<Measure[]>(INITIAL_MEASURES);

   return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-100 px-6 py-10">
         <ChordPlayer chordSynth={chordSynth} metronomeSynth={metronomeSynth} bpm={bpm} measures={measures} />
         <ProgressionEditor measures={measures} setMeasures={setMeasures} />
         <BpmSlider bpm={bpm} setBpm={setBpm} />
      </main>
  )
}

export default App
