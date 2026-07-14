import React from 'react';

interface ControlsPanelProps {
   isPlaying: boolean;
   onTogglePlayback: () => void;
   bpm: number;
   onBpmChange: (bpm: number) => void;
   isLooping: boolean;
   onLoopingChange: (looping: boolean) => void;
   isMetronome: boolean;
   onMetronomeChange: (metronome: boolean) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
   isPlaying,
   onTogglePlayback,
   bpm,
   onBpmChange,
   isLooping,
   onLoopingChange,
   isMetronome,
   onMetronomeChange,
}) => {
   return (
      <div className="flex flex-col flex-wrap items-center justify-between gap-6 border border-gray-300 p-4 md:flex-row">
         {/* Start/Stop Button */}
         <button
            onClick={onTogglePlayback}
            className={`min-w-[120px] border border-gray-300 bg-white px-6 py-2 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-gray-100 ${
               isPlaying ? 'text-red-600' : 'text-gray-900'
            }`}
         >
            {isPlaying ? 'Stop' : 'Start'}
         </button>

         {/* BPM Adjuster */}
         <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">BPM:</label>
            <input
               type="range"
               min="40"
               max="200"
               value={bpm}
               onChange={(e) => onBpmChange(Number(e.target.value))}
               className="h-1 w-32 cursor-pointer appearance-none bg-gray-300 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
            />
            <input
               type="number"
               value={bpm}
               onChange={(e) => onBpmChange(Number(e.target.value))}
               className="w-16 border border-gray-300 p-1 text-center text-sm outline-none"
            />
         </div>

         {/* Loop & Metronome Options */}
         <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
               <input
                  type="checkbox"
                  checked={isLooping}
                  onChange={(e) => onLoopingChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-black"
               />
               Loop
            </label>
            
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
               <input
                  type="checkbox"
                  checked={isMetronome}
                  onChange={(e) => onMetronomeChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-black"
               />
               Metronome
            </label>
         </div>
      </div>
   );
};