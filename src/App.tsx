import { useEffect, useMemo, useState } from 'react'
import * as Tone from 'tone'


const MetronomeContainer = ({ metronomeSynth, bpm } : { metronomeSynth: Tone.Synth; bpm: number }) => {
   const [isPlaying, setIsPlaying] = useState(false)
   // audio loop for metronome
   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
      const repeatId = Tone.Transport.scheduleRepeat((time) => {
         metronomeSynth.triggerAttackRelease('C5', '32n', time)
      }, '4n');

      return () => {
         Tone.Transport.cancel(repeatId)
      }
   }, [metronomeSynth]);
   // updater when bpm changes
   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
   }, [bpm]);
   // metronome on/off
   const handleMetronomeToggle = async () => {
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
      <div>
         <h1 className="text-3xl font-bold text-gray-800">Metronome</h1>
         <p className="text-sm text-gray-600">Toggle the beat and keep time.</p>
         <button
         className={`rounded-lg px-4 py-2 font-semibold text-white shadow-md transition ${
            isPlaying
               ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
               : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
         }`}
         onClick={handleMetronomeToggle}>
         {isPlaying ? 'Stop metronome' : 'Start metronome'}
         </button>
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
   // keep for later use
   const guitarSynth = useMemo(() => new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: {
         attack: 0.01,
         decay: 0.1,
         sustain: 0.2,
         release: 0.2
      }
      }).toDestination(),
      [],
   );

   const [bpm, setBpm] = useState(100);

   return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-6">
         <MetronomeContainer metronomeSynth={metronomeSynth} bpm={bpm} />
         <MetronomeSlider bpm={bpm} setBpm={setBpm} />
      </main>
  )
}

export default App
