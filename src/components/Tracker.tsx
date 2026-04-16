import { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Car, MapPin, Moon, Route, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType } from '../utils/license';
import type { DrivingSession } from '../types';

export function Tracker() {
  const { language, userProgress, addDrivingSession, removeDrivingSession, licenseType } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    type: 'normal' as DrivingSession['type'],
    notes: '',
    instructorName: '',
  });

  const isDE = language === 'de';
  const isUmschreibung = getLearningPathFromLicenseType(licenseType) === 'umschreibung';

  // Legal minimums in Germany (in minutes)
  // total: 0 - No minimum for normal lessons, but typically ~18-20 lessons
  // ueberland: 225 - 5 × 45 min
  // autobahn: 180 - 4 × 45 min
  // nacht: 135 - 3 × 45 min

  const getTypeLabel = (type: DrivingSession['type']) => {
    const labels = {
      normal: { de: 'Normal', en: 'Regular' },
      ueberland: { de: 'Überland', en: 'Country' },
      autobahn: { de: 'Autobahn', en: 'Highway' },
      nacht: { de: 'Nacht', en: 'Night' },
    };
    return isDE ? labels[type].de : labels[type].en;
  };

  const getTypeIcon = (type: DrivingSession['type']) => {
    switch (type) {
      case 'normal': return <Car className="h-4 w-4" />;
      case 'ueberland': return <Route className="h-4 w-4" />;
      case 'autobahn': return <MapPin className="h-4 w-4" />;
      case 'nacht': return <Moon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: DrivingSession['type']) => {
    switch (type) {
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'ueberland': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'autobahn': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'nacht': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
    }
  };

  const handleAddSession = () => {
    addDrivingSession(newSession);
    setShowAddForm(false);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      type: 'normal',
      notes: '',
      instructorName: '',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isDE ? 'de-DE' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const normalMinutes = userProgress.drivingSessions
    .filter(s => s.type === 'normal')
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isDE ? 'Fahrtenbuch' : 'Driving Log'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isDE
              ? 'Dokumentiere deine Fahrstunden'
              : 'Track your driving lessons'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-600 dark:shadow-blue-900/30"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs">{isDE ? 'Gesamt' : 'Total'}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {Math.floor(userProgress.totalDrivingMinutes / 60)}h {userProgress.totalDrivingMinutes % 60}m
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {userProgress.drivingSessions.length} {isDE ? 'Fahrstunden' : 'sessions'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Car className="h-4 w-4" />
            <span className="text-xs">{isDE ? 'Normal' : 'Regular'}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {Math.floor(normalMinutes / 45)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isDE ? 'Übungsfahrten' : 'practice lessons'}
          </p>
        </div>
      </div>

      {/* Special Drives Requirements */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        {isUmschreibung ? (
          <>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isDE ? 'Umschreibung: Fahrpraxis-Überblick' : 'Conversion: Practice Overview'}
            </h3>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/40 dark:bg-purple-900/10">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {isDE ? 'Keine gesetzlichen Pflicht-Sonderfahrten' : 'No legal mandatory special drives'}
              </p>
              <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                {isDE
                  ? 'Bei der Umschreibung gibt es in der Regel keine vorgeschriebenen 5-4-3 Sonderfahrten. Dein Fahrlehrer kann trotzdem Übungsstunden für Autobahn, Überland oder Nacht empfehlen.'
                  : 'For license conversion, the usual 5-4-3 special drives are generally not legally required. Your instructor may still recommend country road, highway, or night practice.'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { type: 'ueberland' as const, icon: '🛣️' },
                { type: 'autobahn' as const, icon: '🛤️' },
                { type: 'nacht' as const, icon: '🌙' },
              ].map((item) => {
                const minutes = userProgress.specialDrivingMinutes[item.type];
                return (
                  <div key={item.type} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/40">
                    <div className="mb-1 text-lg">{item.icon}</div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{getTypeLabel(item.type)}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{Math.floor(minutes / 45)}×45</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isDE ? 'Pflicht-Sonderfahrten' : 'Required Special Drives'}
            </h3>
            
            <div className="space-y-4">
              {[
                { type: 'ueberland' as const, required: 5, icon: '🛣️' },
                { type: 'autobahn' as const, required: 4, icon: '🛤️' },
                { type: 'nacht' as const, required: 3, icon: '🌙' },
              ].map((item) => {
                const minutes = userProgress.specialDrivingMinutes[item.type];
                const completed = Math.floor(minutes / 45);
                const progress = Math.min(100, (completed / item.required) * 100);

                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        completed >= item.required 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500'
                      )}>
                        {completed}/{item.required} × 45 min
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {isDE
                ? '* Gesetzliche Pflichtfahrten (§ 5 Fahrschüler-Ausbildungsordnung): 5×45min Überland, 4×45min Autobahn, 3×45min Nacht'
                : '* Legal special drives (§ 5 FahrschAusbO): 5×45min country roads, 4×45min highway, 3×45min night'}
            </p>
          </>
        )}
      </div>

      {/* Session List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {isDE ? 'Letzte Fahrstunden' : 'Recent Sessions'}
        </h3>

        {userProgress.drivingSessions.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-800/50">
            <Car className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {isDE
                ? 'Noch keine Fahrstunden eingetragen'
                : 'No driving sessions logged yet'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {isDE ? 'Erste Fahrstunde hinzufügen' : 'Add your first session'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {userProgress.drivingSessions
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    getTypeColor(session.type)
                  )}>
                    {getTypeIcon(session.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {getTypeLabel(session.type)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.duration} min
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.date)}
                      {session.instructorName && (
                        <>
                          <span>•</span>
                          <span>{session.instructorName}</span>
                        </>
                      )}
                    </div>
                    {session.notes && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeDrivingSession(session.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isDE ? 'Fahrstunde eintragen' : 'Log Driving Session'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Datum' : 'Date'}
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Art der Fahrt' : 'Drive Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'ueberland', 'autobahn', 'nacht'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewSession({ ...newSession, type })}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        newSession.type === type
                          ? getTypeColor(type) + ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      )}
                    >
                      {getTypeIcon(type)}
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Dauer (Minuten)' : 'Duration (minutes)'}
                </label>
                <div className="flex gap-2">
                  {[45, 90, 135].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setNewSession({ ...newSession, duration })}
                      className={cn(
                        'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                        newSession.duration === duration
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      )}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Fahrlehrer (optional)' : 'Instructor (optional)'}
                </label>
                <input
                  type="text"
                  value={newSession.instructorName}
                  onChange={(e) => setNewSession({ ...newSession, instructorName: e.target.value })}
                  placeholder={isDE ? 'Name' : 'Name'}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Notizen (optional)' : 'Notes (optional)'}
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder={isDE ? 'Was hast du gelernt?' : 'What did you learn?'}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <button
                onClick={handleAddSession}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
              >
                {isDE ? 'Fahrstunde speichern' : 'Save Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
