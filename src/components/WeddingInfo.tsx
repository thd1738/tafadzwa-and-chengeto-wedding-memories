import React, { useState } from 'react';
import { TIMELINE_EVENTS, STORY_MILESTONES } from '../data';
import { Compass, MapPin, Calendar, Heart, Clock, ChevronRight, Map, Milestone, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function WeddingInfo() {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const googleMapsUrl = 'https://maps.google.com/?q=Blissful+Barn+Gardens+Harare';
  const getDirectionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Blissful+Barn+Gardens+Harare';

  return (
    <div className="space-y-0 relative">
      
      {/* 1. OUR STORY CHRONOLOGY SECTION */}
      <section id="story-section" className="py-20 px-4 bg-[#F8F5F0] relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-14">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
              Romance Chronology
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B]">
              Our Story
            </h2>
            <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center bg-white/60 backdrop-blur-md rounded-3xl border border-[#E8DDD0] p-6 md:p-10 shadow-lg">
            
            {/* Milestones Left controller sidebar */}
            <div className="md:col-span-5 space-y-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none gap-2">
              {STORY_MILESTONES.map((milestone, idx) => (
                <button
                  key={milestone.id}
                  onClick={() => setActiveStoryIdx(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 font-sans cursor-pointer whitespace-nowrap md:whitespace-normal flex items-center justify-between border pointer-events-auto ${
                    activeStoryIdx === idx
                      ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] shadow-md scale-[1.02]'
                      : 'bg-white text-[#2B2B2B]/70 hover:text-[#D4AF37] border-[#E8DDD0] hover:bg-[#FFF9F2]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase ${activeStoryIdx === idx ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                      {milestone.date}
                    </span>
                    <span className="text-sm font-semibold mt-0.5">{milestone.title}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${activeStoryIdx === idx ? 'text-[#D4AF37] translate-x-1' : 'text-gray-300 hidden md:block'}`} />
                </button>
              ))}
            </div>

            {/* Selected Milestone Detail Card */}
            <div className="md:col-span-7">
              <div className="space-y-5">
                <div className="h-64 rounded-2xl overflow-hidden shadow-inner border border-[#E8DDD0] relative bg-neutral-100">
                  <img
                    src={STORY_MILESTONES[activeStoryIdx].imageUrl}
                    alt={STORY_MILESTONES[activeStoryIdx].title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  />
                  {/* Floating Date card */}
                  <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#2B2B2B] font-sans text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-[#E8DDD0]">
                    {STORY_MILESTONES[activeStoryIdx].date}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-2xl text-[#2B2B2B] font-medium flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37] animate-pulse" />
                    <span>{STORY_MILESTONES[activeStoryIdx].title}</span>
                  </h4>
                  <p className="text-sm text-[#2B2B2B]/75 font-sans leading-relaxed">
                    {STORY_MILESTONES[activeStoryIdx].description}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. WEDDING TIMELINE PROGRAM DETAILS */}
      <section id="schedule-section" className="py-20 px-4 bg-[#FFF9F2] relative">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
              Hourly Matrimony schedule
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B]">
              Wedding Celebration Schedule
            </h2>
            <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          </div>

          {/* Connected timeline elements */}
          <div className="relative border-l border-[#D4AF37]/35 pl-8 md:pl-12 max-w-2xl mx-auto space-y-12">
            
            {TIMELINE_EVENTS.map((item, idx) => (
              <div key={idx} className="relative group">
                
                {/* Timeline Circle Bullet */}
                <div className="absolute -left-[45px] md:-left-[53px] top-1.5 h-8 w-8 rounded-full bg-[#FFF9F2] border-2 border-[#D4AF37] flex items-center justify-center shadow-md z-10 transition-colors group-hover:bg-[#2B2B2B]">
                  <Clock className="h-3 w-3 text-[#D4AF37] group-hover:text-[#FFF9F2]" />
                </div>

                {/* Event text content */}
                <div className="space-y-2 bg-white/70 backdrop-blur-md rounded-2xl border border-[#E8DDD0] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-xs font-bold font-mono tracking-widest text-[#D4AF37] uppercase flex items-center gap-1 bg-[#D4AF37]/10 px-2.5 py-1 rounded">
                      {item.time}
                    </span>
                    <span className="text-[10px] uppercase font-sans font-medium text-gray-400">
                      August 29, 2026
                    </span>
                  </div>

                  <h4 className="font-serif text-lg text-[#2B2B2B] font-medium leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-[#2B2B2B]/70 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* 3. DIRECTIONS MAPS AND DRIVING ROOT INSTRUCTIONS */}
      <section id="directions-section" className="py-20 px-4 bg-[#F8F5F0] relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
              Venue Navigation
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B]">
              Directions
            </h2>
            <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            
            {/* Harare road steps guide */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#2B2B2B] flex items-center gap-2 mb-4">
                  <Compass className="h-5 w-5 text-[#D4AF37]" />
                  <span>Harare Route Guide</span>
                </h3>

                <div className="space-y-4 font-sans text-xs">
                  
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#FFF9F2] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold font-mono shrink-0">1</div>
                    <p className="text-[#2B2B2B]/85 leading-relaxed pt-0.5">
                      Start on <strong>Robert Mugabe Road</strong> driving east out of CBD.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#FFF9F2] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold font-mono shrink-0">2</div>
                    <p className="text-[#2B2B2B]/85 leading-relaxed pt-0.5">
                      Turn onto <strong>Chiremba Road</strong> leading toward Queensdale.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#FFF9F2] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold font-mono shrink-0">3</div>
                    <p className="text-[#2B2B2B]/85 leading-relaxed pt-0.5">
                      Continue following signs toward <strong>Chadcombe</strong> suburb zone.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#2B2B2B] text-[#FFF9F2] flex items-center justify-center font-bold font-mono shrink-0">4</div>
                    <p className="text-[#2B2B2B] font-semibold leading-relaxed pt-0.5">
                      Arrive at <strong>Blissful Barn Gardens</strong> private driveway.
                    </p>
                  </div>

                </div>
              </div>

              {/* Extra venue details */}
              <div className="mt-8 pt-4 border-t border-[#FFF9F2]">
                <p className="text-[11px] text-[#2B2B2B]/65 font-sans leading-relaxed">
                  * Ample secured guard-patrolled valet parking is available inside the main flower garden compound gates.
                </p>
              </div>
            </div>

            {/* Location coordinates container */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-md flex flex-col justify-between">
              
              <div className="space-y-3.5">
                <span className="inline-flex items-center gap-1 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider font-sans">
                  <MapPin className="h-3 w-3" />
                  <span>Blissful Barn Gardens</span>
                </span>

                <h3 className="font-serif text-2xl text-[#2B2B2B] font-medium leading-none">
                  Harare, Zimbabwe
                </h3>

                <p className="text-xs text-[#2B2B2B]/70 font-sans leading-relaxed">
                  Chadcombe, Harare East, Zimbabwe. A picturesque setting featuring beautifully landscaped floral pathways, pristine open pastures, and an elegant luxury climate barn setup.
                </p>
                
                {/* Simulated Beautiful Stylized Wedding Map Placard */}
                <div className="relative rounded-xl overflow-hidden h-40 border border-[#E8DDD0] bg-neutral-100 mt-2 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
                    alt="Scenic Garden"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter grayscale saturate-50"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-[#2B2B2B]/10 to-[#2B2B2B]/60" />
                  
                  <div className="relative text-center text-white p-4">
                    <MapPin className="h-8 w-8 text-[#D4AF37] mx-auto animate-bounce" />
                    <p className="font-serif font-semibold mt-1 text-sm">Blissful Barn Gardens</p>
                    <p className="text-[10px] text-gray-200 mt-0.5">S17° 53' East, Harare</p>
                  </div>
                </div>
              </div>

              {/* Redirection Navigation CTA Row */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#E8DDD0] bg-white hover:bg-neutral-50 text-[#2B2B2B] transition-colors pointer-events-auto"
                >
                  <Map className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Open Maps</span>
                </a>

                <a
                  href={getDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-[#2B2B2B] hover:bg-[#D4AF37] hover:text-[#2B2B2B] transition-colors shadow-sm pointer-events-auto"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
