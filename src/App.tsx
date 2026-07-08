import { useEffect, useMemo, useState } from 'react'
import * as Tone from 'tone'

const C_CHORD = ['C3', 'E3', 'G3']

const ChordPlayer = ({
   chordSynth,
   metronomeSynth,
   bpm,
}: {
   chordSynth: Tone.PolySynth;
   metronomeSynth: Tone.Synth;
   bpm: number;
}) => {
   const [isPlaying, setIsPlaying] = useState(false)
   const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false)

   // audio loop for the C chord half notes
   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
      const chordRepeatId = Tone.Transport.scheduleRepeat((time) => {
         chordSynth.triggerAttackRelease(C_CHORD, '2n', time)
      }, '2n');

      return () => {
         Tone.Transport.clear(chordRepeatId)
      }
   }, [bpm, chordSynth]);

   // optional quarter-note metronome click
   useEffect(() => {
      if (!isMetronomeEnabled) return;

      const metronomeRepeatId = Tone.Transport.scheduleRepeat((time) => {
         metronomeSynth.triggerAttackRelease('C5', '32n', time)
      }, '4n');

      return () => {
         Tone.Transport.clear(metronomeRepeatId)
      }
   }, [isMetronomeEnabled, metronomeSynth]);

   // updater when bpm changes
   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
   }, [bpm]);

   // playback on/off
   const handlePlaybackToggle = async () => {
      await Tone.start()
      if (isPlaying) {
         Tone.Transport.stop();
         setIsPlaying(false);
         return;
      }
      Tone.Transport.start();
      setIsPlaying(true);
   }

   return (
      <div className="flex flex-col items-center gap-4">
         <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">C Chord Player</h1>
            <p className="text-sm text-gray-600">Play a C chord in half notes at the selected tempo.</p>
         </div>
         <button
         className={`rounded-lg px-4 py-2 font-semibold text-white shadow-md transition ${
            isPlaying
               ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
               : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
         }`}
         onClick={handlePlaybackToggle}>
         {isPlaying ? 'Stop chord' : 'Start chord'}
         </button>
         <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
               type="checkbox"
               checked={isMetronomeEnabled}
               onChange={(event) => setIsMetronomeEnabled(event.target.checked)}
               className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            />
            Metronome
         </label>
      </div>
   );
}

interface BpmSliderProps {
   bpm: number;
   setBpm: (value: number) => void;
}

const MetronomeSlider = ({ bpm, setBpm }: BpmSliderProps) => {
   const MIN_BPM = 40;
   const MAX_BPM = 200;

   const handleBpmChange = (newValue: string) => {
      if (newValue === '') return; // Allow temporarily empty
      const parsedValue = Number(newValue);
      if      (parsedValue < MIN_BPM) { setBpm(MIN_BPM); } 
      else if (parsedValue > MAX_BPM) { setBpm(MAX_BPM); } 
      else                            { setBpm(parsedValue); }
   }

   return (
      <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
         <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Set BPM:</label>
            <input
               type="range"
               min={MIN_BPM}
               max={MAX_BPM}
               value={bpm} 
               onChange={(e) => handleBpmChange(e.target.value)}
               className="h-2 w-40 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
               type="number"
               min={MIN_BPM}
               max={MAX_BPM}
               value={bpm}
               onChange={(e) => handleBpmChange(e.target.value)}
               className="w-16 text-center border border-gray-300 rounded p-1 text-sm font-semibold"
            />
         </div>
      </div>
   );
}

function App() {
   const metronomeSynth = useMemo(() => new Tone.Synth({
         oscillator: { type: 'triangle' },
      }).toDestination(),
      [],
   );
   const chordSynth = useMemo(() => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth' },
      envelope: {
         attack: 0.02,
         decay: 0.15,
         sustain: 0.35,
         release: 0.4
      }
      }).toDestination(),
      [],
   );

   const [bpm, setBpm] = useState(100);

   return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-6">
         <ChordPlayer chordSynth={chordSynth} metronomeSynth={metronomeSynth} bpm={bpm} />
         <MetronomeSlider bpm={bpm} setBpm={setBpm} />
      </main>
  )
}

export default App
