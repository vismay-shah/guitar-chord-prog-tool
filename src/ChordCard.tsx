// ChordCard.tsx
import React, { useRef, useEffect } from 'react';
import type { MeasureSlot } from './types';
import { SLOT_OPTIONS } from './types';

interface ChordCardProps {
   chord: MeasureSlot;
   index: number;
   isActive: boolean;
   canRemove: boolean;
   onRemove: () => void;
   onChordChange: (newChord: MeasureSlot) => void;
}

export const ChordCard: React.FC<ChordCardProps> = ({
   chord,
   index,
   isActive,
   canRemove,
   onRemove,
   onChordChange,
}) => {
   // --- Bug 2 Fix: Scroll Active Card Into View ---
   const cardRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (isActive && cardRef.current) {
         cardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
         });
      }
   }, [isActive]);

   return (
      <div 
         ref={cardRef} // Attached ref
         className={`relative flex h-56 w-full flex-none flex-col overflow-hidden snap-center rounded-sm border-2 transition-all sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] ${
            isActive 
               ? 'border-black bg-gray-100 shadow-[0_0_10px_rgba(0,0,0,0.1)]' 
               : 'border-gray-300 bg-white hover:border-gray-400'
         }`}
      >
         {/* Card Header */}
         <div className="flex items-center justify-between px-3 pt-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
               {isActive ? 'Playing' : `Slot ${index + 1}`}
            </div>
            {canRemove && (
               <button 
                  onClick={onRemove}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove Chord"
               >
                  ✕
               </button>
            )}
         </div>

         {/* Center Display */}
         <div className="flex flex-grow items-center justify-center pointer-events-none">
            <span className="text-5xl font-semibold text-gray-900">
               {chord === 'rest' ? '-' : chord}
            </span>
         </div>
         
         {/* Dropdown Selector */}
         <div className="w-full border-t border-gray-200 bg-gray-50/50 transition-colors hover:bg-gray-100">
            <select
               value={chord}
               onChange={(e) => onChordChange(e.target.value as MeasureSlot)}
               className="w-full cursor-pointer appearance-none bg-transparent py-2.5 text-center text-sm font-medium text-gray-700 outline-none"
            >
               <option value="" disabled>Change chord...</option>
               {SLOT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option === 'rest' ? 'Rest' : option}
                  </option>
               ))}
            </select>
         </div>
      </div>
   );
};