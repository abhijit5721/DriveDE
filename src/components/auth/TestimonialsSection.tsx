/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Star, MapPin, BadgeCheck, ShieldCheck, Award, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

/**
 * DRI-5: Dedicated Social Proof section targeting Expat/Umschreibung conversions.
 * Mounted below #problem-solution on the landing page.
 */
export function TestimonialsSection() {
  const { language } = useAppStore();
  const isDe = language === 'de';

  const stories = [
    {
      name: 'Priya R.',
      location: 'Hamburg',
      flag: '🇮🇳',
      role: isDe ? 'Umschreibung aus Indien' : 'Converted Indian License',
      text: isDe
        ? 'Nach 8 Jahren Fahrerfahrung in Indien musste ich trotzdem die deutsche Prüfung machen. Der Umschreibungsmodus hat mir genau gezeigt, was hier anders ist — bestanden im 1. Versuch!'
        : 'After 8 years of driving in India, I still had to take the German exam. The Umschreibung mode showed me exactly what is different here — passed on my first attempt!',
      rating: 5
    },
    {
      name: 'Carlos M.',
      location: 'Berlin',
      flag: '🇧🇷',
      role: isDe ? 'Umschreibung aus Brasilien' : 'Converted Brazilian License',
      text: isDe
        ? 'Als Expat war die Bürokratie das Schlimmste. DriveDE hat mir Schritt für Schritt erklärt, welche Dokumente ich brauche und wie die praktische Prüfung abläuft.'
        : 'As an expat, the bureaucracy was the worst part. DriveDE walked me through exactly which documents I needed and how the practical exam works.',
      rating: 5
    },
    {
      name: 'Elena K.',
      location: 'München',
      flag: '🇺🇸',
      role: isDe ? 'Umschreibung aus den USA' : 'Converted US License',
      text: isDe
        ? 'Mein US-Führerschein aus Texas brauchte die volle Prüfung. Die GPS-Warnungen haben mich vor dem klassischen Tempolimit-Fehler bewahrt. Absolute Empfehlung!'
        : 'My Texas license required the full exam. The GPS speed warnings saved me from the classic speed limit mistake that fails most expats. Highly recommend!',
      rating: 5
    },
    {
      name: 'Tomasz W.',
      location: 'Frankfurt',
      flag: '🇬🇧',
      role: isDe ? 'Umschreibung nach Brexit' : 'Post-Brexit UK Conversion',
      text: isDe
        ? 'Nach dem Brexit war unklar, was mit meinem UK-Führerschein passiert. DriveDE hatte die Antworten und hat mich sicher durch die Umschreibung gebracht.'
        : 'After Brexit, it was unclear what would happen with my UK license. DriveDE had the answers and guided me safely through the entire conversion.',
      rating: 5
    }
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: isDe ? 'TÜV-bereit' : 'TÜV-ready' },
    { icon: BadgeCheck, label: '100% DSGVO' },
    { icon: Star, label: isDe ? '5-Sterne Bewertungen' : '5-Star Ratings' },
    { icon: Globe, label: isDe ? 'Für Expats gemacht' : 'Built for Expats' }
  ];

  return (
    <section id="expat-stories" className="relative z-10 bg-slate-900 px-6 py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-bold text-purple-400 uppercase tracking-widest">
            {isDe ? 'Erfolge internationaler Fahrer' : 'Expat Success Stories'}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl leading-tight">
            {isDe ? 'Ausländischer Führerschein?' : 'Foreign License?'}{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {isDe ? 'Erfolgreich umgeschrieben.' : 'Successfully Converted.'}
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            {isDe
              ? 'Expats aus der ganzen Welt haben ihre Umschreibung mit DriveDE gemeistert — im ersten Anlauf.'
              : 'Expats from around the world mastered their Umschreibung with DriveDE — on the first attempt.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-3xl border border-slate-800 bg-slate-800/20 p-6 text-left transition hover:border-purple-500/30"
            >
              <div className="flex text-amber-400 mb-4">
                {[...Array(story.rating)].map((_, rIdx) => (
                  <Star key={rIdx} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="flex-1 text-slate-300 text-sm leading-relaxed mb-6 italic">"{story.text}"</p>
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{story.flag} {story.name}</p>
                  <p className="text-xs text-purple-400 font-semibold">{story.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-400">
                  <MapPin className="h-3 w-3 text-blue-400" />
                  {story.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/40 px-5 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-md"
            >
              <badge.icon className="h-4 w-4 text-emerald-400" />
              {badge.label}
            </div>
          ))}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/40 px-5 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-md">
            <Award className="h-4 w-4 text-amber-400" />
            {isDe ? '1.200+ Fahrschüler' : '1,200+ Students'}
          </div>
        </div>
      </div>
    </section>
  );
}
