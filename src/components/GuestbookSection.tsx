import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { GuestbookMessage } from '../types';
import { MessageSquare, Mic, Square, Trash, Heart, Play, Pause, Send, Radio, User, AlertCircle, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GuestbookSection() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [localList, setLocalList] = useState<GuestbookMessage[]>([]);

  // Liking controls
  const [likedMsgs, setLikedMsgs] = useState<string[]>([]);

  // Microphone voice state controls
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBase64, setVoiceBase64] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState('');

  // Audio Playback states
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Load Local Likes and Fallbacks
  useEffect(() => {
    const savedLikes = localStorage.getItem('guestbook_likes');
    if (savedLikes) {
      try {
        setLikedMsgs(JSON.parse(savedLikes));
      } catch (e) {
        console.warn(e);
      }
    }

    const savedLocal = localStorage.getItem('guestbook_local_history');
    if (savedLocal) {
      try {
        setLocalList(JSON.parse(savedLocal));
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  // 2. Setup Real-time Firestore Sync
  useEffect(() => {
    const guestbookCollectionPath = 'guestbook';
    
    const unsubscribe = onSnapshot(
      query(collection(db, guestbookCollectionPath), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: GuestbookMessage[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as GuestbookMessage);
        });
        
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(list);
      },
      (error) => {
        console.warn("Guestbook sub block error: using local fallbacks", error);
        
        const fallback = [...localList];
        fallback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(fallback);

        try {
          handleFirestoreError(error, OperationType.GET, guestbookCollectionPath);
        } catch (e) {
          // Do not crash the view
        }
      }
    );

    return () => unsubscribe();
  }, [localList]);

  // Recording Functions
  const startRecording = async () => {
    try {
      setMicError('');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Scale convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Turn off stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Set recording duration counter
      setRecordingDuration(0);
      durationTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 25) { // limiting to 25 seconds for size reasons
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Mic Blocked or Failed:', err);
      setMicError('Microphone block. Please enable permissions or type wishes instead.');
    }
  };

  const stopRecording = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteVoiceRecording = () => {
    setVoiceBase64(null);
    setRecordingDuration(0);
  };

  // Submit Guestbook message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!text.trim() && !voiceBase64)) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowISO = new Date().toISOString();

    const newMessage: GuestbookMessage = {
      id: messageId,
      name: name.trim(),
      text: text.trim() || 'Recorded voice wishes left for Tafadzwa & Chengeto! 🤍',
      likes: 0,
      createdAt: nowISO,
      ...(voiceBase64 ? { voiceUrl: voiceBase64 } : {})
    };

    // Firebase upload
    const msgPath = `guestbook/${messageId}`;
    try {
      await setDoc(doc(db, 'guestbook', messageId), newMessage);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, msgPath);
      } catch (e) {
        // Cached or local
      }
    }

    // Always append to local caching lists
    const updatedLocal = [newMessage, ...localList];
    setLocalList(updatedLocal);
    localStorage.setItem('guestbook_local_history', JSON.stringify(updatedLocal));

    // Reset fields
    setName('');
    setText('');
    setVoiceBase64(null);
    setRecordingDuration(0);
  };

  // Hearts message vote count
  const handleLikeMessage = async (id: string) => {
    const isLiked = likedMsgs.includes(id);
    let updated: string[];

    if (isLiked) {
      updated = likedMsgs.filter(item => item !== id);
      setLikedMsgs(updated);
      setMessages(p => p.map(m => m.id === id ? { ...m, likes: Math.max(0, m.likes - 1) } : m));
      try {
        await updateDoc(doc(db, 'guestbook', id), { likes: increment(-1) });
      } catch (e) {}
    } else {
      updated = [...likedMsgs, id];
      setLikedMsgs(updated);
      setMessages(p => p.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
      try {
        await updateDoc(doc(db, 'guestbook', id), { likes: increment(1) });
      } catch (e) {}
    }
    localStorage.setItem('guestbook_likes', JSON.stringify(updated));
  };

  // Audio Playback trigger
  const playVoice = (id: string, url: string) => {
    if (playingVoiceId === id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      const audio = new Audio(url);
      activeAudioRef.current = audio;
      setPlayingVoiceId(id);
      
      audio.play();
      audio.onended = () => {
        setPlayingVoiceId(null);
      };
    }
  };

  return (
    <section id="guestbook-section" className="py-20 px-4 bg-[#FFF9F2] relative overflow-hidden">
      
      {/* Decorative ambient flower blur element */}
      <div className="absolute top-20 -right-24 h-96 w-96 rounded-full bg-[#D4AF37]/5 filter blur-[120px]" />
      <div className="absolute -bottom-20 -left-24 h-96 w-96 rounded-full bg-[#D4AF37]/5 filter blur-[120px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
            Wishes & Congratulations
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B]">
            The Live Guestbook
          </h2>
          <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          <p className="text-[#2B2B2B]/60 max-w-sm mx-auto mt-4 text-sm font-sans">
            Leave written messages or record high-fidelity voice notes directly onto the couples wall dashboard.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          
          {/* Form Entry Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-xl space-y-6">
            <h3 className="font-serif text-xl font-medium text-[#2B2B2B] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
              <span>Leave Blessings</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              
              <div>
                <label className="text-xs font-semibold text-[#2B2B2B]/80 uppercase tracking-wider block mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tendai and Chidza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-neutral-50/50 text-[#2B2B2B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2B2B2B]/80 uppercase tracking-wider block mb-1.5">
                  Blessings & Wishes
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a sweet congratulatory note for Tafadzwa and Chengeto..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-neutral-50/50 text-[#2B2B2B] resize-none"
                />
              </div>

              {/* VOICE RECORDER COMPONENT */}
              <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#D4AF37]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2B2B2B]/80 flex items-center gap-1.5 uppercase tracking-wider">
                    <Mic className="h-4 w-4 text-[#D4AF37]" />
                    <span>Include Voice Message</span>
                  </span>
                  
                  {isRecording && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                      <Radio className="h-3 w-3" />
                      <span>{recordingDuration}s / 25s</span>
                    </span>
                  )}
                </div>

                {!voiceBase64 ? (
                  /* Recording controls button */
                  <div>
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-full py-2.5 rounded-lg bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 pointer-events-auto"
                      >
                        <Square className="h-3 w-3 fill-white" />
                        <span>Stop Recording Note</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-full py-2.5 rounded-lg border border-dashed border-[#D4AF37] bg-white hover:bg-[#FFF9F2] text-[#2B2B2B] hover:text-[#D4AF37] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors pointer-events-auto"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        <span>Record Warm wishes Vocal</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Audio recorded ready state */
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#E8DDD0]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-700 font-medium font-sans">Voice vocal record complete</span>
                    </div>
                    <button
                      type="button"
                      onClick={deleteVoiceRecording}
                      className="px-2 py-1 text-[10px] text-rose-600 hover:bg-rose-50 rounded uppercase font-bold flex items-center gap-1 transition-colors pointer-events-auto"
                    >
                      <Trash className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

                {micError && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-sans">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{micError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isRecording}
                className="w-full py-3 rounded-full bg-[#2B2B2B] hover:bg-[#D4AF37] text-white hover:text-[#2B2B2B] text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 pointer-events-auto disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Blessings</span>
              </button>
            </form>
          </div>

          {/* Cards columns stream viewer */}
          <div className="lg:col-span-3">
            {messages.length === 0 ? (
              <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-[#E8DDD0] p-8 md:p-10 text-center shadow-lg relative overflow-hidden flex flex-col justify-center items-center min-h-[440px] space-y-6">
                {/* Floating gold background light glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#D4AF37]/5 filter blur-2xl pointer-events-none" />
                
                <div className="space-y-4 max-w-sm mx-auto flex flex-col items-center">
                  {/* Luxury handwritten note / envelope icon */}
                  <div className="inline-flex h-14 w-14 rounded-full bg-[#FFF9F2] border border-[#D4AF37]/35 items-center justify-center text-[#D4AF37] shadow-sm animate-pulse mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-open">
                      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/>
                      <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-bold text-[#D4AF37] block">
                      Couples Guestbook
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-[#2B2B2B] leading-tight font-medium">
                      No messages have been shared yet
                    </h3>
                    <p className="text-xs text-[#2B2B2B]/60 leading-relaxed font-sans max-w-xs mx-auto">
                      Leave your wishes, blessings, and memories for Tafadzwa & Chengeto. Your message will appear here instantly for everyone to enjoy.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xs pt-2">
                  <button
                    onClick={() => {
                      const nameInput = document.querySelector('input[placeholder="e.g. Tendai and Chidza"]') as HTMLInputElement;
                      if (nameInput) {
                        nameInput.focus();
                        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="w-full bg-[#2B2B2B] hover:bg-[#D4AF37] hover:text-[#2B2B2B] text-white py-3 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                  >
                    <span>Write First Message</span>
                  </button>

                  <button
                    onClick={() => {
                      startRecording();
                    }}
                    className="w-full bg-[#FFF9F2] hover:bg-white text-[#2B2B2B] hover:text-[#D4AF37] border border-[#D4AF37]/30 py-3 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                  >
                    <Mic className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>Record Voice Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isLiked = likedMsgs.includes(msg.id);
                    // Generate a subtle random pseudo-rotation based on the index to mimic beautifully placed paper notes
                    const rotateVal = idx % 2 === 0 ? (idx * 0.7) % 1.5 : -((idx * 0.9) % 1.5);
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.94, y: 30, rotate: rotateVal }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.05, 0.25) }}
                        whileHover={{ 
                          y: -4, 
                          rotate: rotateVal * 0.4, 
                          boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.08)',
                          transition: { duration: 0.25, ease: 'easeOut' }
                        }}
                        className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8DDD0] shadow-sm relative group pointer-events-auto"
                      >
                        {/* Timestamp relative badges */}
                        <span className="absolute top-4 right-4 text-[9px] text-[#2B2B2B]/40 font-mono">
                          {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>

                        <div className="flex items-start gap-4">
                          
                          {/* Guest avatar sphere */}
                          <div className="h-10 w-10 shrink-0 rounded-full bg-[#FFFAF2] border border-[#E8DDD0] flex items-center justify-center text-[#D4AF37]">
                            <User className="h-4 w-4" />
                          </div>

                          <div className="space-y-2.5 w-full">
                            <h4 className="font-serif font-medium text-[#2B2B2B] text-base leading-none">
                              {msg.name}
                            </h4>

                            <p className="text-sm text-[#2B2B2B]/75 leading-relaxed font-sans italic">
                              "{msg.text}"
                            </p>

                            {/* RENDER VOICE NOTE PLAYBACK IF AVAILABLE */}
                            {msg.voiceUrl && (
                              <div className="pt-2">
                                <button
                                  onClick={() => playVoice(msg.id, msg.voiceUrl!)}
                                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#FFF9F2] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-sans text-[#2B2B2B] transition-all pointer-events-auto shadow-sm cursor-pointer"
                                >
                                  {playingVoiceId === msg.id ? (
                                    <>
                                      <Pause className="h-4.5 w-4.5 text-[#D4AF37] fill-[#D4AF37]" />
                                      <span className="font-semibold text-[#D4AF37]">Playing Audio Wish...</span>
                                      {/* Waves */}
                                      <div className="flex items-end gap-0.5 h-3">
                                        <span className="w-0.5 bg-[#D4AF37] h-1.5 animate-[soundWave_0.6s_infinite_alternate]" />
                                        <span className="w-0.5 bg-[#D4AF37] h-3 animate-[soundWave_0.4s_infinite_alternate_0.15s]" />
                                        <span className="w-0.5 bg-[#D4AF37] h-2 animate-[soundWave_0.5s_infinite_alternate_0.1s]" />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4.5 w-4.5 text-[#D4AF37] fill-[#D4AF37] ml-0.5" />
                                      <span>Listen to Voice Greetings</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Interactive heart react triggers */}
                            <div className="flex items-center justify-between border-t border-neutral-50 pt-3 mt-4">
                              <button
                                onClick={() => handleLikeMessage(msg.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors text-[11px] font-sans pointer-events-auto cursor-pointer ${
                                  isLiked 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100 font-medium' 
                                    : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50/50'
                                }`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                <span>{msg.likes} Hearts</span>
                              </button>

                              <span className="text-[9px] text-[#D4AF37] tracking-widest font-sans uppercase font-medium select-none">
                                Wedding Card
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
