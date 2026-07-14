// useAudioPlayback.ts
import { useEffect, useMemo, useState, useRef } from 'react';
import * as Tone from 'tone';
import type { MeasureSlot } from './types';
import { CHORDS } from './types';

interface UseAudioPlaybackProps {
   chords: MeasureSlot[];
   bpm: number;
   isLooping: boolean;
   isMetronome: boolean;
   onPlaybackEnd: () => void; // Added callback to inform parent UI to flip 'isPlaying'
}

export function useAudioPlayback({ 
   chords, 
   bpm, 
   isLooping, 
   isMetronome,
   onPlaybackEnd 
}: UseAudioPlaybackProps) {
   const [isPlaying, setIsPlaying] = useState(false);
   const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

   // Stable refs for event callback closures
   const onPlaybackEndRef = useRef(onPlaybackEnd);
   useEffect(() => { onPlaybackEndRef.current = onPlaybackEnd; }, [onPlaybackEnd]);

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
      synth.volume.value = -12; 
      return synth;
   }, []);

   const isMetronomeRef = useRef(isMetronome);
   useEffect(() => { isMetronomeRef.current = isMetronome; }, [isMetronome]);

   useEffect(() => {
      Tone.Transport.bpm.value = bpm;
   }, [bpm]);

   useEffect(() => {
      const metronomeRepeatId = Tone.Transport.scheduleRepeat((time) => {
         if (isMetronomeRef.current) {
            metronomeSynth.triggerAttackRelease('C6', '32n', time);
         }
      }, '4n');
      return () => { Tone.Transport.clear(metronomeRepeatId); };
   }, [metronomeSynth]);

   // --- Playback Schedule Effect ---
   useEffect(() => {
      const events = chords.map((chord, index) => ({
         time: `${index}:0:0`, 
         notes: chord === 'rest' ? [] : CHORDS[chord],
         duration: '1m',
         globalIndex: index
      }));

      const progressionPart = new Tone.Part((time, value) => {
         if (value.notes.length > 0) {
            chordSynth.triggerAttackRelease(value.notes, value.duration, time);
         }
         Tone.Draw.schedule(() => {
            setActiveSlotIndex(value.globalIndex);
         }, time);
      }, events);

      progressionPart.loop = isLooping;
      progressionPart.loopEnd = `${chords.length}m`;
      progressionPart.start(0);

      // --- Bug 1 Fix: Schedule the cleanup event at the end of the timeline ---
      const endMarkerId = Tone.Transport.schedule(() => {
         Tone.Draw.schedule(() => {
            if (!isLooping) {
               // Reset player UI states
               setIsPlaying(false);
               setActiveSlotIndex(null);
               onPlaybackEndRef.current();
               
               // Stop transport
               Tone.Transport.stop();
               Tone.Transport.position = 0;
               chordSynth.releaseAll(); // Stop residual synth tails
            }
         }, "+0"); // Queue immediately when the play duration completes
      }, `${chords.length}:0:0`);

      return () => { 
         progressionPart.dispose(); 
         Tone.Transport.clear(endMarkerId);
      };
   }, [chordSynth, chords, isLooping]);

   const togglePlayback = async () => {
      await Tone.start();
      if (isPlaying) {
         Tone.Transport.stop();
         Tone.Transport.position = 0;
         setIsPlaying(false);
         setActiveSlotIndex(null);
         chordSynth.releaseAll(); // Clean release on forced stop
         return;
      }
      Tone.Transport.start();
      setIsPlaying(true);
   };

   return {
      isPlaying,
      activeSlotIndex,
      togglePlayback,
      setIsPlaying,
      setActiveSlotIndex,
   };
}