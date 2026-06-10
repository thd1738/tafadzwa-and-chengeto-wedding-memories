import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Memory, MemoryCategory } from '../types';
import { INITIAL_MEMORIES } from '../data';
import { compressImage, formatWeddingDate } from '../utils/compressor';
import { Heart, Search, Eye, Download, X, Calendar, User, SlidersHorizontal, Image as ImageIcon, Sparkles, Camera, Music, Wine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GallerySectionProps {
  onUploadTrigger: () => void;
}

export default function GallerySection({ onUploadTrigger }: GallerySectionProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [likedMemories, setLikedMemories] = useState<string[]>([]);
  const [localMemories, setLocalMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load Liked Memories from LocalStorage to restrict single votes
  useEffect(() => {
    const saved = localStorage.getItem('wedding_liked_memories');
    if (saved) {
      try {
        setLikedMemories(JSON.parse(saved));
      } catch (e) {
        console.warn(e);
      }
    }

    // Load custom uploads from localStorage for offline/cached experience
    const savedUploads = localStorage.getItem('wedding_custom_uploads');
    if (savedUploads) {
      try {
        setLocalMemories(JSON.parse(savedUploads));
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  // 2. Setup Real-time Firestore Sync
  useEffect(() => {
    const memoriesCollectionPath = 'memories';
    
    // Subscribe to firestore memories ordered by creation time
    const unsubscribe = onSnapshot(
      query(collection(db, memoriesCollectionPath), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const firestoreList: Memory[] = [];
        snapshot.forEach((d) => {
          firestoreList.push({ id: d.id, ...d.data() } as Memory);
        });

        // Merge firestore with initial seeds (ensuring seeds always show if they aren't written to cloud)
        const combined = [...firestoreList];
        
        // Add initial seeds that do not already exist in firestore list
        INITIAL_MEMORIES.forEach(seed => {
          if (!combined.some(c => c.id === seed.id)) {
            combined.push(seed);
          }
        });

        // Ensure proper descending timeline sorting
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMemories(combined);
      },
      (error) => {
        console.warn("Firestore snapshot subscription failed or rules offline: using fallback templates", error);
        // Fallback: merge INITIAL_MEMORIES with locally saved uploads
        const combinedFallback = [...localMemories];
        INITIAL_MEMORIES.forEach(seed => {
          if (!combinedFallback.some(l => l.id === seed.id)) {
            combinedFallback.push(seed);
          }
        });
        combinedFallback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMemories(combinedFallback);
        
        // Log in conforming format to trigger AI diagnostics if needed
        try {
          handleFirestoreError(error, OperationType.GET, memoriesCollectionPath);
        } catch (e) {
          // Do not crash the UI, keep operating on cached states
        }
      }
    );

    return () => unsubscribe();
  }, [localMemories]);

  // Categories list
  const categories = ['All', ...Object.values(MemoryCategory)];

  // Filter memories
  const filteredMemories = memories.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Heart Liking Action
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening lightbox
    
    if (likedMemories.includes(id)) {
      // Un-heart
      const updatedLikes = likedMemories.filter(likedId => likedId !== id);
      setLikedMemories(updatedLikes);
      localStorage.setItem('wedding_liked_memories', JSON.stringify(updatedLikes));

      // Local state update
      setMemories(prev => prev.map(m => m.id === id ? { ...m, likes: Math.max(0, m.likes - 1) } : m));

      // Update to firestore cloud
      try {
        const docRef = doc(db, 'memories', id);
        // decrement by 1
        await updateDoc(docRef, { likes: increment(-1) });
      } catch (err) {
        // Ignored or handled locally
      }
    } else {
      // Add heart
      const updatedLikes = [...likedMemories, id];
      setLikedMemories(updatedLikes);
      localStorage.setItem('wedding_liked_memories', JSON.stringify(updatedLikes));

      // Local state update
      setMemories(prev => prev.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));

      // Update to firestore cloud
      try {
        const docRef = doc(db, 'memories', id);
        // increment by 1
        await updateDoc(docRef, { likes: increment(1) });
      } catch (err) {
        // Ignored or handled locally
      }
    }
  };

  return (
    <section id="gallery-section" className="py-20 px-4 bg-[#F8F5F0]">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
            Capturing Love
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B]">
            Wedding Memory Gallery
          </h2>
          <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          <p className="text-[#2B2B2B]/60 max-w-md mx-auto mt-4 text-sm font-sans">
            Real-time live updates of photos and videos uploaded by friends, family, and loved ones.
          </p>
        </div>

        {/* Conditional Toolbar rendering - only shown when there's actual content */}
        {memories.length > 0 && (
          <div className="flex flex-col gap-6 mb-10">
            {/* Scrollable Categories List (Mobile touch-friendly) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none px-2 mask-linear">
              <SlidersHorizontal className="h-4 w-4 text-[#D4AF37] shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedMemory(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all duration-300 pointer-events-auto shadow-sm ${
                    selectedCategory === cat
                      ? 'bg-[#2B2B2B] text-[#FFF9F2] shadow-md border border-[#2B2B2B]'
                      : 'bg-white text-[#2B2B2B]/75 hover:text-[#D4AF37] border border-[#E8DDD0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Luxury Search Bar */}
            <div className="relative max-w-md w-full mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Search uploads by guest name or caption..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FFF9F2]/30 text-[#2B2B2B]"
              />
            </div>
          </div>
        )}

        {/* Gallery Content or Premium Empty State Grid */}
        {memories.length === 0 ? (
          /* PREMIUM VISUALLY RICH EMPTY STATE */
          <div className="grid md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto mt-6">
            
            {/* Left Box: Elegant invitation, clean camera icon, and primary upload call-to-action button */}
            <div className="md:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl border border-[#E8DDD0] p-8 md:p-10 text-center md:text-left shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              {/* Gold background radial light glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#D4AF37]/5 filter blur-3xl pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="inline-flex h-14 w-14 rounded-full bg-[#FFF9F2] border border-[#D4AF37]/35 items-center justify-center text-[#D4AF37] shadow-sm animate-pulse">
                  <Camera className="h-6 w-6" />
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-bold text-[#D4AF37] block">
                    Awaiting First Memory
                  </span>
                  <h3 className="font-serif text-2xl md:text-3.5xl text-[#2B2B2B] leading-tight font-medium">
                    Be the first to share a special moment
                  </h3>
                  <p className="text-xs md:text-sm text-[#2B2B2B]/60 leading-relaxed font-sans mt-2">
                    Every smile, tear, and dance step tells a part of Tafadzwa & Chengeto's story. Upload your photos and short videos to instantly broadcast them on the live collective wall during the celebration.
                  </p>
                </div>
              </div>
              
              <div className="pt-8 relative z-10">
                <button
                  onClick={onUploadTrigger}
                  className="w-full bg-[#2B2B2B] hover:bg-[#D4AF37] hover:text-[#2B2B2B] text-white py-4 px-8 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer pointer-events-auto group"
                >
                  <Sparkles className="h-4 w-4 text-[#D4AF37] group-hover:text-[#2B2B2B] transition-colors" />
                  <span>Upload First Memory</span>
                </button>
              </div>
            </div>

            {/* Right Box: "Coming Alive Soon" animation containing romantic transparent placeholder frames */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4 relative">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8F5F0] to-transparent z-10 pointer-events-none" />
              
              {/* Frame I: Ceremony Placeholder */}
              <motion.div
                initial={{ opacity: 0.3, y: 10 }}
                animate={{ 
                  opacity: [0.35, 0.7, 0.35],
                  y: [0, -6, 0]
                }}
                transition={{ 
                  opacity: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  y: { repeat: Infinity, duration: 5.5, ease: "easeInOut" }
                }}
                className="aspect-[3/4] rounded-2xl border border-dashed border-[#D4AF37]/40 bg-white/50 p-4 flex flex-col justify-between shadow-xs"
              >
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-sans font-semibold text-[#D4AF37]/75">
                  <span>Frame I</span>
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className="text-center space-y-2 py-4">
                  <div className="h-9 w-9 mx-auto rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#D4AF37]/50 border border-[#D4AF37]/20">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <p className="font-serif text-[11px] italic text-[#2B2B2B]/40">Coming Alive Soon</p>
                </div>
                <div className="text-[8px] tracking-wider uppercase font-sans font-bold text-[#2B2B2B]/60 text-center">
                  Vow Exchange Ceremony
                </div>
              </motion.div>

              {/* Frame II: Reception Placeholder */}
              <motion.div
                initial={{ opacity: 0.2, y: -5 }}
                animate={{ 
                  opacity: [0.25, 0.6, 0.25],
                  y: [-2, 4, -2]
                }}
                transition={{ 
                  opacity: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.6 },
                  y: { repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.6 }
                }}
                className="aspect-[4/3] rounded-2xl border border-dashed border-[#D4AF37]/40 bg-white/50 p-4 flex flex-col justify-between shadow-xs self-center"
              >
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-sans font-semibold text-[#D4AF37]/75">
                  <span>Frame II</span>
                  <Camera className="h-3 w-3" />
                </div>
                <div className="text-center py-2">
                  <p className="font-serif text-[11px] italic text-[#2B2B2B]/40">Awaiting your captures</p>
                </div>
                <div className="text-[8px] tracking-wider uppercase font-sans font-bold text-[#2B2B2B]/60 text-center">
                  Reception Grandeur
                </div>
              </motion.div>

              {/* Frame III: Celebration/Dance Floor Placeholder */}
              <motion.div
                initial={{ opacity: 0.25, y: -10 }}
                animate={{ 
                  opacity: [0.3, 0.65, 0.3],
                  y: [4, -4, 4]
                }}
                transition={{ 
                  opacity: { repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 1.2 },
                  y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.2 }
                }}
                className="aspect-[3/4] rounded-2xl border border-dashed border-[#D4AF37]/30 bg-white/40 p-4 flex flex-col justify-between shadow-xs"
              >
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-sans font-semibold text-[#D4AF37]/75">
                  <span>Frame III</span>
                  <Music className="h-3 w-3" />
                </div>
                <div className="text-center space-y-2 py-4">
                  <div className="h-9 w-9 mx-auto rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#D4AF37]/50 border border-[#D4AF37]/25">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <p className="font-serif text-[11px] italic text-[#2B2B2B]/40">Ready to sync live</p>
                </div>
                <div className="text-[8px] tracking-wider uppercase font-sans font-bold text-[#2B2B2B]/60 text-center">
                  Electric Dance Floor
                </div>
              </motion.div>

              {/* Frame IV: Banquet & Toasts Placeholder */}
              <motion.div
                initial={{ opacity: 0.35, y: 15 }}
                animate={{ 
                  opacity: [0.4, 0.75, 0.4],
                  y: [0, 6, 0]
                }}
                transition={{ 
                  opacity: { repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1.8 },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.8 }
                }}
                className="aspect-[4/5] rounded-2xl border border-dashed border-[#D4AF37]/45 bg-white/55 p-4 flex flex-col justify-between shadow-xs mt-4"
              >
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-sans font-semibold text-[#D4AF37]/75">
                  <span>Frame IV</span>
                  <Wine className="h-3.5 w-3.5" />
                </div>
                <div className="text-center py-6">
                  <p className="font-serif text-[11px] italic text-[#2B2B2B]/40">Capture the toasts</p>
                </div>
                <div className="text-[8px] tracking-wider uppercase font-sans font-bold text-[#2B2B2B]/60 text-center">
                  Gourmet Banquet Feasts
                </div>
              </motion.div>

            </div>
          </div>
        ) : filteredMemories.length === 0 ? (
          /* FILTER RESULTS EMPTY STATE (SOME REAL DATA EXISTS BUT IS FILTERED OUT) */
          <div className="text-center py-20 bg-white/70 rounded-2xl border border-[#E8DDD0] max-w-sm mx-auto shadow-md">
            <Search className="h-10 w-10 text-[#D4AF37]/50 mx-auto mb-4" />
            <p className="text-sm font-medium text-[#2B2B2B]/80 font-sans">No matching records found</p>
            <p className="text-xs text-[#2B2B2B]/50 max-w-xs mx-auto mt-2 px-6">
              There are no uploaded wedding memories matching your search terms or category filter. Try clearing filters or resetting search criteria.
            </p>
          </div>
        ) : (
          /* PINTEREST-STYLE MASONRY LAYOUT FOR REAL STORIES */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance] box-border">
            {filteredMemories.map((item, index) => {
              const isLiked = likedMemories.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  layoutId={`memory-card-${item.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: Math.min(index * 0.08, 0.4), 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className="break-inside-avoid relative rounded-xl overflow-hidden shadow-md border border-[#E8DDD0] bg-white group cursor-pointer pointer-events-auto"
                  onClick={() => setSelectedMemory(item)}
                  whileHover={{ 
                    y: -6, 
                    boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.3, ease: 'easeOut' }
                  }}
                >
                  {/* Photo or Video Thumbnail */}
                  <div className="overflow-hidden relative">
                    {item.type === 'photo' ? (
                      <img
                        src={item.url}
                        alt={item.caption}
                        referrerPolicy="no-referrer"
                        className="w-full object-cover max-h-[480px] min-h-[160px] opacity-95 group-hover:opacity-100 scale-100 group-hover:scale-[1.04] transition-transform duration-700 ease-out pointer-events-none"
                      />
                    ) : (
                      <div className="relative w-full aspect-video min-h-[180px] bg-neutral-900 flex items-center justify-center">
                        {item.url.startsWith('data:') ? (
                          <video
                            src={item.url}
                            className="w-full max-h-[300px] object-cover scale-100 group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400"
                            alt="Video Placeholder"
                            className="w-full h-full object-cover opacity-50 blur-sm scale-100 group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                          />
                        )}
                        {/* Video Indicator */}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="h-12 w-12 rounded-full bg-white/85 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <span className="border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-[#2B2B2B] ml-1" />
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Absolute badging */}
                  <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-semibold tracking-wider text-[#2B2B2B] uppercase shadow-sm border border-[#E8DDD0]">
                    {item.category}
                  </span>

                  {/* Overlaid Detail Content: visible on hover on PC, constant details on card bottom */}
                  <div className="p-4 border-t border-[#E8DDD0]/40 bg-linear-to-b from-white/95 to-white flex flex-col justify-between">
                    <div>
                      <p className="text-[12px] text-[#2B2B2B]/85 font-sans font-medium line-clamp-2">
                        "{item.caption}"
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-500 font-sans">
                        <User className="h-3 w-3 text-[#D4AF37]" />
                        <span className="font-semibold text-gray-700">{item.guestName}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatWeddingDate(item.createdAt).split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Bottom row actions */}
                    <div className="flex items-center justify-between mt-4 border-t border-[#FFF9F2]/80 pt-3">
                      <button
                        onClick={(e) => handleLike(item.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-sans pointer-events-auto cursor-pointer ${
                          isLiked 
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-medium' 
                            : 'bg-gray-50 text-gray-400 hover:text-[#D4AF37]'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-[#D4AF37]' : ''}`} />
                        <span>{item.likes}</span>
                      </button>

                      <span className="text-[10px] text-[#D4AF37] font-medium tracking-wider uppercase flex items-center gap-1 group-hover:underline">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* LIGHTBOX / FULL SCREEN IMAGE AND VIDEO VIEWER */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#2B2B2B]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedMemory(null)}
            >
              <button
                className="absolute top-4 right-4 md:top-8 md:right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors pointer-events-auto"
                onClick={() => setSelectedMemory(null)}
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25 }}
                className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row shadow-2xl border border-[#E8DDD0]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual side */}
                <div className="md:w-3/5 bg-neutral-950 flex items-center justify-center max-h-[50vh] md:max-h-full aspect-video md:aspect-auto overflow-hidden">
                  {selectedMemory.type === 'photo' ? (
                    <img
                      src={selectedMemory.url}
                      alt={selectedMemory.caption}
                      referrerPolicy="no-referrer"
                      className="max-h-[50vh] md:max-h-[80vh] w-full object-contain"
                    />
                  ) : (
                    <video
                      src={selectedMemory.url}
                      controls
                      autoPlay
                      className="max-h-[50vh] md:max-h-[80vh] w-full object-contain"
                    />
                  )}
                </div>

                {/* Details side */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-[#FFF9F2] overflow-y-auto">
                  <div className="space-y-4">
                    <span className="inline-block bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider text-[#D4AF37] uppercase">
                      {selectedMemory.category}
                    </span>

                    <h4 className="font-serif text-2xl text-[#2B2B2B] leading-snug">
                      "{selectedMemory.caption}"
                    </h4>

                    <div className="w-12 h-[1px] bg-[#D4AF37]" />

                    {/* Guest info card */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E8DDD0]">
                      <div className="h-10 w-10 rounded-full bg-[#E5C050]/20 text-[#2B2B2B] flex items-center justify-center font-serif text-sm font-semibold">
                        {selectedMemory.guestName[0]?.toUpperCase() || 'G'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2B2B2B] font-sans">
                          {selectedMemory.guestName}
                        </p>
                        <p className="text-[10px] text-gray-500 font-sans">
                          Wedding Guest uploader
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500 font-sans">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>Uploaded {formatWeddingDate(selectedMemory.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-3 mt-8 border-t border-[#E8DDD0] pt-6">
                    <button
                      onClick={(e) => handleLike(selectedMemory.id, e)}
                      className={`w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border flex items-center justify-center gap-2 pointer-events-auto ${
                        likedMemories.includes(selectedMemory.id)
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-white hover:opacity-90 shadow-md'
                          : 'bg-white border-[#E8DDD0] text-[#2B2B2B] hover:bg-neutral-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedMemories.includes(selectedMemory.id) ? 'fill-white' : ''}`} />
                      <span>{likedMemories.includes(selectedMemory.id) ? 'Loved! Hearted' : 'Give Heart Reaction'}</span>
                    </button>

                    <a
                      href={selectedMemory.url}
                      download={`Tafadzwa-Chengeto-Wedding-${selectedMemory.id}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border border-[#E8DDD0] bg-[#2B2B2B] text-white hover:bg-[#D4AF37] hover:text-[#2B2B2B] flex items-center justify-center gap-2 shadow-sm pointer-events-auto"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download HD Copy</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
