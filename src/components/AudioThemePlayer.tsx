import React, { useRef, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

export default function AudioThemePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const startSynthesizer = () => {
    try {
      // 1. Create AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 2. Setup Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      // Soft fade in of master volume
      masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.0);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 3. Define chord frequencies (Tafadzwa & Chengeto's Romantic Harmony)
      // Cmaj9, Am9, Fmaj7, Em7
      const chords = [
        [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9 (C3, E3, G3, B3, D4)
        [110.00, 138.59, 164.81, 220.00, 277.18], // A major add9 (A2, C#3, E3, A3, C#4)
        [174.61, 220.00, 261.63, 311.13, 349.23], // Fmaj7 (F3, A3, C4, D#4, F4)
        [146.83, 174.61, 220.00, 261.63, 293.66]  // Dm7/9 (D3, F3, A3, C4, E4)
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!ctx || ctx.state === 'suspended') return;
        const now = ctx.currentTime;
        const notes = chords[chordIndex];
        
        // Advance chord index
        chordIndex = (chordIndex + 1) % chords.length;

        // Play each note in the chord as a soft synth pad
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gainNode = ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // lowpass filter for subduing highs & warmth
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450 + idx * 50, now);

          // Gentle gain envelope for string-pad like sweep
          gainNode.gain.setValueAtTime(0, now);
          // Slow attack
          gainNode.gain.linearRampToValueAtTime(0.04, now + 1.5 + idx * 0.2);
          // Release
          gainNode.gain.setValueAtTime(0.04, now + 5.0);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);

          osc.connect(filter);
          filter.connect(gainNode);
          if (masterGainRef.current) {
            gainNode.connect(masterGainRef.current);
          }

          osc.start(now);
          osc.stop(now + 9.0);
        });

        // Trigger sparkling melody chimes random intervals
        triggerSparkle();
      };

      const triggerSparkle = () => {
        if (!ctx) return;
        const now = ctx.currentTime;
        const bellPitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6 (Pentatonic spark)
        
        // Trigger 2-3 chimes spread over the chord duration
        for (let i = 0; i < 3; i++) {
          const delay = i * 1.5 + Math.random() * 0.5;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

          osc.type = 'sine';
          // select random pentatonic pitch
          const randomFreq = bellPitches[Math.floor(Math.random() * bellPitches.length)];
          osc.frequency.setValueAtTime(randomFreq, now + delay);

          gainNode.gain.setValueAtTime(0, now + delay);
          gainNode.gain.linearRampToValueAtTime(0.06, now + delay + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.0);

          if (panner) {
            panner.pan.setValueAtTime((Math.random() * 2) - 1, now + delay);
            osc.connect(panner);
            panner.connect(gainNode);
          } else {
            osc.connect(gainNode);
          }

          if (masterGainRef.current) {
            gainNode.connect(masterGainRef.current);
          }

          osc.start(now + delay);
          osc.stop(now + delay + 2.5);
        }
      };

      // Perform initial sweep immediately
      playChord();

      // Schedule subsequent harmony shifts every 8 seconds
      const intervalId = window.setInterval(playChord, 8000);
      intervalIdRef.current = intervalId;

    } catch (err) {
      console.warn('Web Audio Playback blocked or failed:', err);
    }
  };

  const stopSynthesizer = () => {
    if (masterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
      masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    }
    
    setTimeout(() => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }, 700);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynthesizer();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startSynthesizer();
    }
  };

  return (
    <div id="audio-theme-controller" className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={togglePlayback}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/80 backdrop-blur-md border border-[#E8DDD0] shadow-lg text-[#2B2B2B] hover:text-[#D4AF37] transition-all duration-300 pointer-events-auto"
      >
        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <>
              <Volume2 className="h-4 w-4 text-[#D4AF37] animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
              </span>
            </>
          ) : (
            <VolumeX className="h-4 w-4 opacity-70" />
          )}
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase font-sans">
          {isPlaying ? 'Wedding Music On' : 'Play Wedding Music'}
        </span>
        
        {/* Real-time synthesized visual volume waves */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-[#D4AF37] h-1.5 animate-[soundWave_0.8s_ease-in-out_infinite_alternate]" />
            <span className="w-0.5 bg-[#D4AF37] h-3 animate-[soundWave_0.6s_ease-in-out_infinite_alternate_0.2s]" />
            <span className="w-0.5 bg-[#D4AF37] h-2 animate-[soundWave_0.7s_ease-in-out_infinite_alternate_0.1s]" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
