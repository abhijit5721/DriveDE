/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { BadgeCheck, ShieldCheck, Globe, FileCheck, GraduationCap, ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

/**
 * DRI-5 / DRI-14: Expat & Umschreibung section.
 * Factual Anlage-11 tier information instead of invented testimonials —
 * real usefulness is more convincing than fabricated quotes, and it's honest.
 */
export function TestimonialsSection() {
  const { language } = useAppStore();
  const isDe = language === 'de';

  const tiers = [
    {
      icon: ArrowLeftRight,
      title: isDe ? 'EU / EWR Führerschein' : 'EU / EEA licence',
      badge: isDe ? 'Keine Prüfungen' : 'No exams',
      text: isDe
        ? 'Einfacher Kartentausch bei der Führerscheinstelle — keine Theorie- oder Praxisprüfung nötig. DriveDE führt dich durch die Unterlagen.'
        : 'A simple card exchange at the licensing office — no theory or practical exam required. DriveDE walks you through the paperwork.',
    },
    {
      icon: FileCheck,
      title: isDe ? 'Anlage-11-Länder (USA, Japan, Australien …)' : 'Annex 11 countries (US, Japan, Australia …)',
      badge: isDe ? 'Nur Verwaltung' : 'Admin only',
      text: isDe
        ? 'Dein Führerschein wird ohne Prüfungen umgeschrieben. DriveDE zeigt dir genau, welche Dokumente du brauchst und wie der Ablauf ist.'
        : 'Your licence converts without exams. DriveDE shows exactly which documents you need and how the process works.',
    },
    {
      icon: GraduationCap,
      title: isDe ? 'Alle anderen Länder (Indien, Brasilien, China …)' : 'All other countries (India, Brazil, China …)',
      badge: isDe ? 'Theorie + Praxis' : 'Theory + practical',
      text: isDe
        ? 'Beide Prüfungen sind nötig — aber ohne Pflichtstunden. Genau hier hilft DriveDE: GPS-Tracking, KI-Auswertungen und Prüfungsreife auf Englisch.'
        : 'Both exams are required — but with no mandatory lesson hours. That is exactly where DriveDE helps: GPS tracking, AI debriefings and exam readiness, in English.',
    },
  ];

  const trustBadges = [
    { icon: Globe, label: isDe ? '100+ Herkunftsländer abgedeckt' : '100+ origin countries covered' },
    { icon: ShieldCheck, label: '100% DSGVO' },
    { icon: BadgeCheck, label: isDe ? 'Vollständig auf Englisch' : 'Fully available in English' },
  ];

  return (
    <section id="expat-stories" className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
            {isDe ? 'Für internationale Fahrer' : 'For international drivers'}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl leading-tight">
            {isDe ? 'Ausländischer Führerschein? ' : 'Foreign licence? '}
            <span className="text-blue-600">{isDe ? 'So läuft die Umschreibung.' : 'Here is how conversion works.'}</span>
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            {isDe
              ? 'Was du tun musst, hängt von deinem Herkunftsland ab (Anlage 11 FeV). DriveDE kennt die Regeln für über 100 Länder.'
              : 'What you need to do depends on your country of origin (Anlage 11 FeV). DriveDE knows the rules for 100+ countries.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm p-6 text-left transition hover:border-blue-300"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <tier.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {tier.badge}
                </span>
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900 leading-snug">{tier.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{tier.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-600"
            >
              <badge.icon className="h-4 w-4 text-blue-600" />
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
