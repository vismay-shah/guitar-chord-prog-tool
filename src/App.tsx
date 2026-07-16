// App.tsx
import { useState } from 'react';
import type { MeasureSlot } from './types';
import { useAudioPlayback } from './useAudioPlayback';
import { ChordCard } from './ChordCard';
import { ControlsPanel } from './ControlsPanel';

export default function App() {
   const [chords, setChords] = useState<MeasureSlot[]>(['C', 'F', 'G', 'Am']);
   const [bpm, setBpm] = useState(100);
   const [isLooping, setIsLooping] = useState(true);
   const [isMetronome, setIsMetronome] = useState(false);
   const [isPlayingState, setIsPlayingState] = useState(false); // Controlled locally

   // Hook handles audio state sync
   const { isPlaying, activeSlotIndex, togglePlayback } = useAudioPlayback({
      chords,
      bpm,
      isLooping,
      isMetronome,
      onPlaybackEnd: () => setIsPlayingState(false), // Flip state on complete!
   });

   // Sync local toggle switch
   const handleToggle = () => {
      togglePlayback();
      setIsPlayingState(!isPlaying);
   };

   const updateChord = (index: number, newChord: MeasureSlot) => {
      const newChords = [...chords];
      newChords[index] = newChord;
      setChords(newChords);
   };

   const addChord = () => {
      setChords([...chords, 'C']);
   };

   const removeChord = (index: number) => {
      if (chords.length <= 1) return;
      setChords(chords.filter((_, i) => i !== index));
   };

   return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
         <div className="w-full max-w-4xl rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
            
            <h1 className="mb-10 text-center text-xl font-medium tracking-wide text-gray-800">
               Chord Progression Tool
            </h1>
            <div className="mx-auto mb-10 max-w-sm rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-center text-xs tracking-wide text-gray-500 shadow-inner">
               <p className="mb-1">Tap chord name to change chord</p>
               <p>Use the X delete a chord</p>
            </div>

            <div className="relative mb-10 w-full">
              { /*<div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">*/}
               <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 &::-webkit-scrollbar]:visible [-ms-overflow-style:visible] ">

                  
                  {chords.map((chord, index) => (
                     <ChordCard
                        key={index}
                        chord={chord}
                        index={index}
                        isActive={activeSlotIndex === index}
                        canRemove={chords.length > 1}
                        onRemove={() => removeChord(index)}
                        onChordChange={(newChord) => updateChord(index, newChord)}
                     />
                  ))}

                  <button 
                     onClick={addChord}
                     className="flex h-56 w-half flex-none cursor-pointer snap-center items-center justify-center rounded-sm border-2 border-gray-300 bg-gray-50 transition-colors hover:border-gray-500 hover:bg-gray-100 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)]"
                  >    
                     <span className="text-6xl font-light text-gray-400 min-w-28">+</span>
                  </button>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />

               </div>
               <p className='text-center font-light text-gray-600 p-2'>← Scroll for more →</p>
            </div>
           
            <ControlsPanel
               isPlaying={isPlaying}
               onTogglePlayback={handleToggle}
               bpm={bpm}
               onBpmChange={setBpm}
               isLooping={isLooping}
               onLoopingChange={setIsLooping}
               isMetronome={isMetronome}
               onMetronomeChange={setIsMetronome}
            />

         </div>
      </main>
   );
}