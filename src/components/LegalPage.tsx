import { Mail, MapPin, Phone, Shield, FileText, Scale, Building2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PageHeader } from './PageHeader';

interface LegalPageProps {
  page: 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer';
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

export function LegalPage({ page, onBack }: LegalPageProps) {
  const language = useAppStore((state) => state.language);
  const isDE = language === 'de';

  const pageMeta = {
    privacy: {
      title: isDE ? 'Datenschutzerklärung' : 'Privacy Policy',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    terms: {
      title: isDE ? 'AGB / Nutzungsbedingungen' : 'Terms & Conditions',
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    gdpr: {
      title: isDE ? 'DSGVO & Betroffenenrechte' : 'GDPR & Data Rights',
      icon: Scale,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    impressum: {
      title: isDE ? 'Impressum' : 'Imprint / Legal Notice',
      icon: Building2,
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    disclaimer: {
      title: isDE ? 'Haftungsausschluss & Sicherheitshinweis' : 'Disclaimer & Safety Notice',
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  }[page];

  const Icon = pageMeta.icon;

  const renderContent = () => {
    switch (page) {
      case 'privacy':
        return (
          <div className="space-y-4">
            <Section title={isDE ? '1. Verantwortlicher' : '1. Controller'}>
              <p>
                {isDE
                  ? 'Bitte ersetze vor Launch diese Platzhalterdaten durch deine echten Daten: DriveDE, Musterstraße 1, 10115 Berlin, E-Mail: privacy@drivede.app.'
                  : 'Before launch, replace these placeholder details with your real company data: DriveDE, Musterstraße 1, 10115 Berlin, Email: privacy@drivede.app.'}
              </p>
            </Section>
            <Section title={isDE ? '2. Welche Daten verarbeitet werden' : '2. What data is processed'}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{isDE ? 'App-Einstellungen wie Sprache, Dark Mode, Lernpfad und Getriebetyp' : 'App settings such as language, dark mode, learning path, and transmission type'}</li>
                <li>{isDE ? 'Lokaler Lernfortschritt, absolvierte Lektionen, Quizstände und Fahrtenbuchdaten' : 'Local learning progress, completed lessons, quiz results, and tracker/logbook data'}</li>
                <li>{isDE ? 'Optionale Kontakt- oder Feedbackdaten, wenn Nutzer aktiv eine Anfrage senden' : 'Optional contact or feedback data when a user actively sends an inquiry'}</li>
              </ul>
            </Section>
            <Section title={isDE ? '3. Zweck der Verarbeitung' : '3. Purpose of processing'}>
              <p>
                {isDE
                  ? 'Die Daten werden zur Bereitstellung der App-Funktionen, zur Speicherung des Lernfortschritts, zur Verbesserung der Nutzererfahrung sowie – falls später aktiviert – zur Synchronisierung über mehrere Geräte verwendet.'
                  : 'Data is used to provide app functionality, save study progress, improve user experience, and—if enabled later—to synchronize progress across devices.'}
              </p>
            </Section>
            <Section title={isDE ? '4. Speicherung und Empfänger' : '4. Storage and recipients'}>
              <p>
                {isDE
                  ? 'In der aktuellen Beta-Version werden die meisten Daten lokal auf dem Gerät gespeichert. Falls später Cloud-Dienste, Analytik oder Zahlungsdienste eingesetzt werden, müssen diese hier einzeln benannt werden.'
                  : 'In the current beta version, most data is stored locally on the device. If cloud services, analytics, or payment providers are added later, they must be listed here individually.'}
              </p>
            </Section>
            <Section title={isDE ? '5. Rechtsgrundlagen' : '5. Legal bases'}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{isDE ? 'Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung bzw. Bereitstellung der App' : 'Art. 6(1)(b) GDPR – performance of a contract / app provision'}</li>
                <li>{isDE ? 'Art. 6 Abs. 1 lit. f DSGVO – berechtigte Interessen an sicherem und stabilem App-Betrieb' : 'Art. 6(1)(f) GDPR – legitimate interests in secure and stable app operation'}</li>
                <li>{isDE ? 'Art. 6 Abs. 1 lit. a DSGVO – Einwilligung, falls optionale Analytik oder Marketing aktiviert werden' : 'Art. 6(1)(a) GDPR – consent, if optional analytics or marketing is enabled'}</li>
              </ul>
            </Section>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4">
            <Section title={isDE ? '1. Geltungsbereich' : '1. Scope'}>
              <p>
                {isDE
                  ? 'Diese Nutzungsbedingungen regeln die Nutzung der App DriveDE. Die App dient der Unterstützung bei der Vorbereitung auf praktische Fahrstunden und Fahrprüfungen in Deutschland.'
                  : 'These terms govern the use of the DriveDE app. The app is designed to support preparation for practical driving lessons and practical exams in Germany.'}
              </p>
            </Section>
            <Section title={isDE ? '2. Kein Ersatz für Fahrlehrer oder amtliche Quellen' : '2. No substitute for instructors or official sources'}>
              <p>
                {isDE
                  ? 'Die App ersetzt keine Fahrschule, keinen Fahrlehrer, keine amtliche Rechtsberatung und keine offiziellen Informationen von Behörden, TÜV oder DEKRA. Maßgeblich sind stets die geltenden Gesetze, Verordnungen und die konkrete Anweisung des Fahrlehrers oder Prüfers.'
                  : 'The app does not replace a driving school, a driving instructor, official legal advice, or official information from authorities, TÜV, or DEKRA. Applicable law and the concrete instructions of the instructor or examiner always prevail.'}
              </p>
            </Section>
            <Section title={isDE ? '3. Nutzung der Inhalte' : '3. Use of content'}>
              <p>
                {isDE
                  ? 'Die Inhalte dürfen ausschließlich für den persönlichen, nicht übertragbaren Lerngebrauch genutzt werden. Eine gewerbliche Weitergabe, systematische Vervielfältigung oder Weiterveröffentlichung ist ohne schriftliche Zustimmung unzulässig.'
                  : 'Content may only be used for personal, non-transferable learning purposes. Commercial redistribution, systematic copying, or republishing is not permitted without written approval.'}
              </p>
            </Section>
            <Section title={isDE ? '4. Verfügbarkeit und Änderungen' : '4. Availability and changes'}>
              <p>
                {isDE
                  ? 'Die App kann fortlaufend angepasst, verbessert oder in einzelnen Funktionen eingeschränkt werden. Es besteht kein Anspruch auf dauerhafte Verfügbarkeit einzelner Inhalte oder Funktionen.'
                  : 'The app may be changed, improved, or have individual features limited over time. There is no claim to permanent availability of any specific content or feature.'}
              </p>
            </Section>
            <Section title={isDE ? '5. Haftungsbeschränkung' : '5. Limitation of liability'}>
              <p>
                {isDE
                  ? 'Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten. Für Schäden aus unsachgemäßer Anwendung der Inhalte im realen Straßenverkehr übernehmen wir keine Haftung, soweit gesetzlich zulässig.'
                  : 'In cases of slight negligence, liability is limited to breaches of essential contractual obligations. To the extent legally permitted, we are not liable for damage arising from improper application of app content in real road traffic.'}
              </p>
            </Section>
          </div>
        );
      case 'gdpr':
        return (
          <div className="space-y-4">
            <Section title={isDE ? 'Deine Rechte nach DSGVO' : 'Your GDPR rights'}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{isDE ? 'Auskunft über verarbeitete personenbezogene Daten' : 'Right of access to personal data processed about you'}</li>
                <li>{isDE ? 'Berichtigung unrichtiger Daten' : 'Right to rectification of inaccurate data'}</li>
                <li>{isDE ? 'Löschung personenbezogener Daten' : 'Right to erasure of personal data'}</li>
                <li>{isDE ? 'Einschränkung der Verarbeitung' : 'Right to restriction of processing'}</li>
                <li>{isDE ? 'Datenübertragbarkeit' : 'Right to data portability'}</li>
                <li>{isDE ? 'Widerspruch gegen bestimmte Verarbeitungen' : 'Right to object to certain processing activities'}</li>
                <li>{isDE ? 'Widerruf einer Einwilligung mit Wirkung für die Zukunft' : 'Right to withdraw consent with effect for the future'}</li>
              </ul>
            </Section>
            <Section title={isDE ? 'So kannst du deine Rechte ausüben' : 'How to exercise your rights'}>
              <p>
                {isDE
                  ? 'Sende eine Anfrage an privacy@drivede.app. Vor Launch müssen hier die echten Kontaktdaten hinterlegt werden. In der aktuellen lokalen App-Version können Nutzer viele Daten direkt durch Zurücksetzen der App oder Löschen der Browser-/Gerätespeicherung entfernen.'
                  : 'Send a request to privacy@drivede.app. Before launch, replace this with your real contact details. In the current local app version, many data points can also be removed directly by resetting the app or clearing browser/device storage.'}
              </p>
            </Section>
            <Section title={isDE ? 'Beschwerderecht' : 'Right to lodge a complaint'}>
              <p>
                {isDE
                  ? 'Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn du der Ansicht bist, dass die Verarbeitung deiner Daten gegen die DSGVO verstößt.'
                  : 'You have the right to lodge a complaint with a data protection supervisory authority if you believe your data is processed in violation of the GDPR.'}
              </p>
            </Section>
          </div>
        );
      case 'impressum':
        return (
          <div className="space-y-4">
            <Section title={isDE ? 'Anbieterkennzeichnung' : 'Provider identification'}>
              <p>
                {isDE
                  ? 'Bitte ersetze diese Platzhalterangaben vor Veröffentlichung vollständig durch die echten Angaben des Betreibers. Beispiel: DriveDE GmbH, Musterstraße 1, 10115 Berlin, Deutschland.'
                  : 'Before publication, replace these placeholder details fully with the real operator details. Example: DriveDE GmbH, Musterstraße 1, 10115 Berlin, Germany.'}
              </p>
            </Section>
            <Section title={isDE ? 'Kontakt' : 'Contact'}>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Musterstraße 1, 10115 Berlin</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@drivede.app</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />+49 30 00000000</div>
              </div>
            </Section>
            <Section title={isDE ? 'Hinweis' : 'Notice'}>
              <p>
                {isDE
                  ? 'Je nach Rechtsform und Tätigkeit können weitere Pflichtangaben erforderlich sein, z. B. Handelsregister, Umsatzsteuer-ID, vertretungsberechtigte Person oder Berufsangaben. Bitte rechtlich prüfen lassen.'
                  : 'Depending on your legal entity and business activity, additional mandatory disclosures may be required, such as commercial register details, VAT ID, authorized representative, or professional information. Please have this reviewed legally.'}
              </p>
            </Section>
          </div>
        );
      case 'disclaimer':
        return (
          <div className="space-y-4">
            <Section title={isDE ? 'Wichtiger Sicherheitshinweis' : 'Important safety notice'}>
              <p>
                {isDE
                  ? 'Die App dient ausschließlich der Lernunterstützung. Inhalte dürfen niemals während des aktiven Führens eines Fahrzeugs verwendet oder gelesen werden. Nutze die App nur vor oder nach der Fahrt oder als Beifahrer.'
                  : 'The app is intended for learning support only. Content must never be used or read while actively driving a vehicle. Use the app only before or after driving, or as a passenger.'}
              </p>
            </Section>
            <Section title={isDE ? 'Keine Garantie für Bestehen oder Vollständigkeit' : 'No guarantee of passing or completeness'}>
              <p>
                {isDE
                  ? 'DriveDE gibt keine Garantie für das Bestehen einer praktischen Prüfung. Prüfungsanforderungen können regional, fahrzeugbezogen oder prüferabhängig variieren. Inhalte werden sorgfältig erstellt, können jedoch trotz Prüfung Fehler oder Vereinfachungen enthalten.'
                  : 'DriveDE does not guarantee passing a practical exam. Exam expectations may vary by region, vehicle, or examiner. Content is prepared carefully but may still contain errors or simplifications despite review.'}
              </p>
            </Section>
            <Section title={isDE ? 'Maßgebliche Quellen' : 'Controlling sources'}>
              <p>
                {isDE
                  ? 'Im Zweifel gelten immer die aktuelle Straßenverkehrs-Ordnung (StVO), Fahrlehrer-Anweisungen, offizielle Prüfkriterien sowie die konkrete Verkehrslage vor Ort.'
                  : 'In case of doubt, the current German Road Traffic Regulations (StVO), instructor directions, official exam criteria, and the actual traffic situation on site always prevail.'}
              </p>
            </Section>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <PageHeader title={pageMeta.title} onBack={onBack} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pageMeta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pageMeta.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {isDE
                ? 'Diese Inhalte sind eine Startvorlage für den Launch. Vor Veröffentlichung bitte alle Platzhalter, Unternehmensdaten und rechtlichen Details final prüfen und anpassen.'
                : 'These contents are a launch-ready starting template. Before publishing, please review and replace all placeholders, company details, and legal specifics.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
