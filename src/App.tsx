import React, { useState, useEffect } from 'react';
import { initializeAnonymousAuth, testConnection } from './firebase';
import UploadModal from './components/UploadModal';
import GallerySection from './components/GallerySection';
import GuestbookSection from './components/GuestbookSection';
import WeddingInfo from './components/WeddingInfo';
import QRSection from './components/QRSection';
import AudioThemePlayer from './components/AudioThemePlayer';

import { 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  MapPin, 
  ChevronDown, 
  QrCode, 
  Menu, 
  X, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial Loader state
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state variables
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeUploadPhoto, setActiveUploadPhoto] = useState(true);

  // Countdown clock state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // 1. App Startup Init
  useEffect(() => {
    // Initiate anonymous authentication silent background flow
    initializeAnonymousAuth();
    testConnection();

    // End pre-loader after 2.8 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // 2. Countdown clock calculations
  useEffect(() => {
    const targetDate = new Date('2026-08-29T10:00:00+02:00').getTime(); // Harare standard timezone

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Trigger scroll to target sections smoothly
  const scrollToId = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Trigger file uploads immediately
  const triggerPhotoUpload = () => {
    setActiveUploadPhoto(true);
    setIsUploadOpen(true);
  };

  const triggerVideoUpload = () => {
    setActiveUploadPhoto(false);
    setIsUploadOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2B2B2B] relative selection:bg-[#D4AF37]/30">
      
      {/* BACKGROUND WEBAUDIO THEME SYNTH MUSIC CONTROLLER */}
      {!isLoading && <AudioThemePlayer />}

      {/* LUXURY WELCOME SPLASH LOADING MONITOR SCREEN */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="splash-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[100] bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="space-y-6 max-w-sm">
              {/* Gold Monogram Shield rings */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="relative h-28 w-28 mx-auto flex items-center justify-center"
              >
                {/* Outlines */}
                <div className="absolute inset-0 border border-[#D4AF37]/45 rounded-full animate-spin [animation-duration:15s]" />
                <div className="absolute inset-1.5 border border-dashed border-[#D4AF37]/30 rounded-full animate-spin [animation-duration:22s] [animation-direction:reverse]" />
                
                {/* Center text initials */}
                <span className="font-cursive text-5xl text-[#D4AF37] relative -top-0.5">T & C</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h4
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-serif text-[13px] tracking-[0.25em] uppercase text-[#D4AF37] font-medium"
                >
                  Tafadzwa & Chengeto
                </motion.h4>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="font-serif text-2xl text-gray-800 font-normal italic"
                >
                  "Eternal Covenant"
                </motion.h2>
              </div>

              {/* Loader Slider */}
              <div className="w-40 h-[2px] bg-neutral-100 mx-auto rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full gold-gradient-bg absolute left-0"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.3, ease: 'easeInOut' }}
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.3 }}
                className="text-[10px] uppercase tracking-widest font-sans font-medium text-gray-500"
              >
                Loading Matrimonial Portal
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER STYLED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFF9F2]/75 backdrop-blur-md border-b border-[#E8DDD0]/50 h-16 flex items-center px-4 md:px-8">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          
          {/* Couple monogram logotype */}
          <button
            onClick={() => scrollToId('hero-section')}
            className="flex items-center gap-2 text-left pointer-events-auto"
          >
            <span className="font-cursive text-3xl gold-text-gradient font-bold leading-none">T & C</span>
            <span className="h-6 w-[1px] bg-gray-300 hidden sm:block" />
            <span className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase hidden sm:block text-gray-600">
              August 29, 2026
            </span>
          </button>

          {/* Desktop Navigation Paths */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-gray-600 font-sans">
            <button onClick={() => scrollToId('gallery-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto">Gallery</button>
            <button onClick={() => scrollToId('story-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto">Our Story</button>
            <button onClick={() => scrollToId('schedule-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto">Schedule</button>
            <button onClick={() => scrollToId('directions-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto">Directions</button>
            <button onClick={() => scrollToId('guestbook-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto">Guestbook</button>
            <button onClick={() => scrollToId('qr-code-section')} className="hover:text-[#D4AF37] transition-colors pointer-events-auto"><QrCode className="h-4 w-4 text-[#D4AF37]" /></button>
          </nav>

          {/* Custom primary action for desktop */}
          <div className="hidden md:block">
            <button
              onClick={triggerPhotoUpload}
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#2B2B2B] hover:bg-[#D4AF37] text-[#FFF9F2] hover:text-[#2B2B2B] transition-all pointer-events-auto shadow-md"
            >
              Upload Photo
            </button>
          </div>

          {/* Mobile Hamburg menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-[#D4AF37] pointer-events-auto"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* MOBILE COMPACT NAVIGATION MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#FFF9F2] flex flex-col p-6 pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-6 border-b border-[#E8DDD0]">
              <span className="font-cursive text-3xl gold-text-gradient font-bold">Tafadzwa & Chengeto</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-black pointer-events-auto"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-base font-medium tracking-wide text-gray-800 mt-10 font-sans">
              <button onClick={() => scrollToId('gallery-section')} className="text-left py-2 hover:text-[#D4AF37] border-b border-neutral-100 pointer-events-auto">Wedding Gallery</button>
              <button onClick={() => scrollToId('story-section')} className="text-left py-2 hover:text-[#D4AF37] border-b border-neutral-100 pointer-events-auto">Our Love Story</button>
              <button onClick={() => scrollToId('schedule-section')} className="text-left py-2 hover:text-[#D4AF37] border-b border-neutral-100 pointer-events-auto">Wedding Schedule</button>
              <button onClick={() => scrollToId('directions-section')} className="text-left py-2 hover:text-[#D4AF37] border-b border-neutral-100 pointer-events-auto">Location & Directions</button>
              <button onClick={() => scrollToId('guestbook-section')} className="text-left py-2 hover:text-[#D4AF37] border-b border-neutral-100 pointer-events-auto">Live Guestbook</button>
              <button onClick={() => scrollToId('qr-code-section')} className="text-left py-2 hover:text-[#D4AF37] flex items-center gap-2 pointer-events-auto">
                <QrCode className="h-4 w-4 text-[#D4AF37]" />
                <span>Flyer Code Card</span>
              </button>
            </nav>

            <div className="mt-auto space-y-3 pt-6 border-t border-[#E8DDD0]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerPhotoUpload();
                }}
                className="w-full py-3 rounded-full text-center text-xs font-semibold uppercase bg-[#2B2B2B] text-white pointer-events-auto"
              >
                Upload Photo
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerVideoUpload();
                }}
                className="w-full py-3 rounded-full text-center text-xs font-semibold uppercase border border-[#E8DDD0] bg-white text-[#2B2B2B] pointer-events-auto"
              >
                Upload Video Clip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. CINEMATIC FULLSCREEN HERO LANDING HOME PAGE */}
      <section 
        id="hero-section" 
        className="relative h-screen min-h-[640px] flex flex-col justify-center items-center px-4 pt-16 text-center select-none overflow-hidden bg-radial from-[#FFF9F2] to-[#E8DDD0]"
      >
        
        {/* Cinematic Backdrop Image + Soft romantic flow filters */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600"
            alt="Scenic Wedding Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-15 filter scale-105 pointer-events-none"
          />
          {/* Floating light particles (CSS based spark background) */}
          <div className="floating-sparkle-bg" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-3xl space-y-6 md:space-y-8 px-2">
          
          <div className="space-y-2">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37] block font-sans"
            >
              Matrimonial Celebration
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
              className="font-cursive text-6xl sm:text-7xl md:text-8xl text-gray-800 leading-none drop-shadow-sm font-black"
            >
              Tafadzwa & Chengeto
            </motion.h1>

            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 0.7 }}
              className="font-sans text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-[#D4AF37]"
            >
              Together Forever
            </motion.h3>
          </div>

          <div className="w-16 h-[1px] bg-[#D4AF37]/50 mx-auto" />

          {/* Location Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-1.5"
          >
            <p className="font-serif text-lg md:text-2xl text-gray-700 italic font-medium">
              29 August 2026
            </p>
            <p className="font-sans text-xs tracking-wider uppercase text-gray-500 font-bold flex items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#D4AF37]" />
              <span>Blissful Barn Gardens, Harare</span>
            </p>
          </motion.div>

          {/* MATRIMONIAL COUNTDOWN CLOCK TIMER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex items-center justify-center gap-3 md:gap-5 pt-2"
          >
            {/* Days block */}
            <div className="glass-panel rounded-xl px-3 py-2.5 md:p-4 min-w-[70px] md:min-w-[85px] border border-[#D4AF37]/25 shadow-md">
              <span className="block font-serif text-2xl md:text-3.5xl font-bold text-[#2B2B2B]">
                {countdown.days}
              </span>
              <span className="block text-[8px] md:text-[10px] tracking-widest uppercase font-semibold text-gray-400 mt-1">
                Days
              </span>
            </div>

            {/* Hours block */}
            <div className="glass-panel rounded-xl px-3 py-2.5 md:p-4 min-w-[70px] md:min-w-[85px] border border-[#D4AF37]/25 shadow-md">
              <span className="block font-serif text-2xl md:text-3.5xl font-bold text-[#2B2B2B]">
                {countdown.hours}
              </span>
              <span className="block text-[8px] md:text-[10px] tracking-widest uppercase font-semibold text-gray-400 mt-1">
                Hours
              </span>
            </div>

            {/* Mins block */}
            <div className="glass-panel rounded-xl px-3 py-2.5 md:p-4 min-w-[70px] md:min-w-[85px] border border-[#D4AF37]/25 shadow-md">
              <span className="block font-serif text-2xl md:text-3.5xl font-bold text-[#2B2B2B]">
                {countdown.minutes}
              </span>
              <span className="block text-[8px] md:text-[10px] tracking-widest uppercase font-semibold text-gray-400 mt-1">
                Min
              </span>
            </div>

            {/* Secs block */}
            <div className="glass-panel rounded-xl px-3 py-2.5 md:p-4 min-w-[70px] md:min-w-[85px] border border-[#D4AF37]/25 shadow-md bg-white">
              <span className="block font-serif text-2xl md:text-3.5xl font-bold text-[#D4AF37] animate-pulse">
                {countdown.seconds}
              </span>
              <span className="block text-[8px] md:text-[10px] tracking-widest uppercase font-semibold text-gray-400 mt-1">
                Sec
              </span>
            </div>
          </motion.div>

          {/* Quick Action Navigation Buttons (with soft glass filters, large hitboxes and anchors) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto"
          >
            {/* Upload Photos button */}
            <button
              onClick={triggerPhotoUpload}
              className="glass-panel hover:bg-[#FFF9F2] px-4 py-3.5 rounded-xl border border-double border-[#D4AF37]/40 shadow-md flex flex-col items-center justify-center gap-1.5 transition-all text-[#2B2B2B] hover:text-[#D4AF37] pointer-events-auto "
            >
              <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] tracking-wider uppercase font-bold font-sans">Upload Photos</span>
            </button>

            {/* Upload Videos button */}
            <button
              onClick={triggerVideoUpload}
              className="glass-panel hover:bg-[#FFF9F2] px-4 py-3.5 rounded-xl border border-double border-[#D4AF37]/40 shadow-md flex flex-col items-center justify-center gap-1.5 transition-all text-[#2B2B2B] hover:text-[#D4AF37] pointer-events-auto "
            >
              <Video className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] tracking-wider uppercase font-bold font-sans">Upload Videos</span>
            </button>

            {/* View Memories slide triggers */}
            <button
              onClick={() => scrollToId('gallery-section')}
              className="glass-panel hover:bg-[#FFF9F2] px-4 py-3.5 rounded-xl border border-double border-[#D4AF37]/40 shadow-md flex flex-col items-center justify-center gap-1.5 transition-all text-[#2B2B2B] hover:text-[#D4AF37] pointer-events-auto"
            >
              <Heart className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] tracking-wider uppercase font-bold font-sans">View Memories</span>
            </button>

            {/* Leave a message triggers */}
            <button
              onClick={() => scrollToId('guestbook-section')}
              className="glass-panel hover:bg-[#FFF9F2] px-4 py-3.5 rounded-xl border border-double border-[#D4AF37]/40 shadow-md flex flex-col items-center justify-center gap-1.5 transition-all text-[#2B2B2B] hover:text-[#D4AF37] pointer-events-auto"
            >
              <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] tracking-wider uppercase font-bold font-sans">Leave Message</span>
            </button>
          </motion.div>

        </div>

        {/* Scroll Indicator Chevron */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 cursor-pointer pointer-events-auto flex flex-col items-center gap-1">
          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gray-500 animate-pulse">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={() => scrollToId('gallery-section')}
          >
            <ChevronDown className="h-5 w-5 text-gray-400 hover:text-[#D4AF37] transition-colors" />
          </motion.div>
        </div>

      </section>

      {/* 2. REAL-TIME MULTI-USER PHOTO & VIDEO GALLERY */}
      <GallerySection />

      {/* 3. PRINTABLE TABLE QR CODE FLIER CARD */}
      <QRSection />

      {/* 4. CHRONOLOGY, SCHEDULE & HARARE DIRECTIONS PANEL */}
      <WeddingInfo />

      {/* 5. GUESTBOOK NOTE GREETINGS & VOICE MESSAGING WALL */}
      <GuestbookSection />

      {/* FOOTER CREDENTIALS */}
      <footer className="py-12 bg-[#2B2B2B] border-t border-neutral-800 text-center text-white/50 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="font-cursive text-3xl gold-text-gradient font-bold leading-none">Tafadzwa & Chengeto</p>
          <p className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-gray-400">
            Married August 29, 2026 • Harare, Zimbabwe
          </p>
          <div className="w-12 h-[1px] bg-[#D4AF37]/50 mx-auto" />
          <p className="text-[9px] font-sans leading-relaxed max-w-xs mx-auto">
            This memory sharing website runs in standalone offline-compatible Progressive Web App format, synced in real-time with Firestore security structures.
          </p>
          <p className="text-[8px] tracking-widest uppercase font-mono text-gray-600 mt-6 pt-6 border-t border-neutral-800/60">
            © 2026 Tafadzwa & Chengeto • Harare Matrimony
          </p>
        </div>
      </footer>

      {/* MODAL WINDOW ACTION FLOUT (PHOTO AND VIDEO PICKING COMPONENT) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

    </div>
  );
}
