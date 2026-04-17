import { useRef, useState, useMemo } from 'react';
import { ArrowLeft, BookOpenText, CarFront, ClipboardCheck, Download, FileText, MonitorSmartphone, Printer, ShieldCheck, AlertCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppStore } from '../store/useAppStore';
import { chapters, getAllLessons, getLessonById } from '../data/curriculum';
import { scenarios } from '../data/scenarios';
import { PageHeader } from './PageHeader';
import { cn } from '../utils/cn';
import type { Lesson, ManeuverStep, Tip } from '../types';

interface InstructorReviewProps {
  onBack: () => void;
}

const sampleLessonIds = ['basics-1a', 'city-2', 'maneuver-1'];
const maneuverLessonIds = ['maneuver-1', 'maneuver-2', 'maneuver-3', 'maneuver-4', 'city-2', 'city-6'];

const rubricItems = [
  {
    areaDe: 'Blickführung & Schulterblick',
    areaEn: 'Observation & shoulder checks',
    checkDe: 'Spiegelarbeit, Schulterblick beim Anfahren, Spurwechsel, Abbiegen und Rückwärtsfahren klar sichtbar.',
    checkEn: 'Mirror use and clear shoulder checks during moving off, lane changes, turning, and reversing.',
    riskDe: 'Fehlender Schulterblick ist einer der häufigsten schweren Prüfungsfehler.',
    riskEn: 'Missing shoulder checks are among the most common serious exam faults.',
  },
  {
    areaDe: 'Vorfahrt & Regelverständnis',
    areaEn: 'Priority & rule application',
    checkDe: 'Rechts-vor-links, Kreisverkehr, Zebrastreifen, Ampeln, abknickende Vorfahrt, Fußgänger/Cyclists.',
    checkEn: 'Right-before-left, roundabouts, zebra crossings, traffic lights, bending priority roads, pedestrians/cyclists.',
    riskDe: 'Unklare Vorfahrtslage oder falsches Verhalten gegenüber Schutzbedürftigen.',
    riskEn: 'Uncertain priority handling or incorrect behavior toward vulnerable road users.',
  },
  {
    areaDe: 'Fahrstreifen & Positionierung',
    areaEn: 'Lane discipline & positioning',
    checkDe: 'Sauberes Einordnen, korrektes Rechtsfahrgebot, Abbiegespuren, Abstand zum Bordstein beim Parken.',
    checkEn: 'Clean positioning, correct keep-right behavior, turning lanes, and curb distance when parking.',
    riskDe: 'Falsche Spurwahl, zu spätes Einordnen oder unsaubere Fahrzeugposition.',
    riskEn: 'Wrong lane choice, late positioning, or poor vehicle placement.',
  },
  {
    areaDe: 'Geschwindigkeit & Fahrzeugkontrolle',
    areaEn: 'Speed & vehicle control',
    checkDe: 'Angepasste Geschwindigkeit, ruhiges Anfahren, Kupplung/Gangwahl bei Schaltwagen, präzises Lenken und Bremsen.',
    checkEn: 'Appropriate speed, smooth moving off, clutch/gear use in manual cars, and precise steering/braking.',
    riskDe: 'Hektik, Abwürgen, unnötig harte Bremsungen oder zu schnelles Heranfahren an Gefahrstellen.',
    riskEn: 'Rushing, stalling, unnecessary harsh braking, or approaching hazards too quickly.',
  },
  {
    areaDe: 'Grundfahraufgaben',
    areaEn: 'Basic maneuvers',
    checkDe: 'Parallelparken, Rückwärts einparken, Wenden, Gefahrenbremsung mit korrekten Beobachtungs- und Pedalabläufen.',
    checkEn: 'Parallel parking, reverse parking, turning, and emergency braking with correct observation and pedal sequence.',
    riskDe: 'Fehlende Beobachtung, falsche Referenzpunkte, unsaubere Endposition, falsche Gefahrenbremsung.',
    riskEn: 'Missing observation, wrong reference points, poor final position, or incorrect emergency braking.',
  },
  {
    areaDe: 'Technikfragen & Abfahrtskontrolle',
    areaEn: 'Technical questions & vehicle check',
    checkDe: 'Ölstand, Reifenprofil, Beleuchtung, Warnleuchten, Warndreieck, Warnweste, Erste-Hilfe-Set.',
    checkEn: 'Oil level, tyre tread, lighting, warning lights, warning triangle, safety vest, first-aid kit.',
    riskDe: 'Unsichere oder auswendig gelernte Antworten ohne praktische Zeigekompetenz.',
    riskEn: 'Unsure answers or memorized responses without being able to physically show the item.',
  },
];

const screenDescriptions = [
  {
    nameDe: 'Dashboard / Startseite',
    nameEn: 'Dashboard / Home',
    textDe: 'Zeigt Lernfortschritt, Fahrstunden, Sonderfahrten bzw. Umschreibungs-Hinweise, Pro-Funktionen und Schnellzugriffe auf prüfungsrelevante Inhalte.',
    textEn: 'Shows learning progress, driving hours, special-drive or conversion notes, premium prompts, and quick access to exam-relevant content.',
  },
  {
    nameDe: 'Kapitelübersicht',
    nameEn: 'Curriculum overview',
    textDe: 'Listet alle Kapitel und Lektionen in didaktischer Reihenfolge, inklusive Schalt/Automatik-Filter, Prüfungs-Badges und Fortschritt je Kapitel.',
    textEn: 'Lists all chapters and lessons in didactic order, including manual/automatic filtering, exam badges, and chapter progress.',
  },
  {
    nameDe: 'Lektionsdetail',
    nameEn: 'Lesson detail',
    textDe: 'Kombiniert geführte Lernpunkte, typische Prüfungsszenarien, Verkehrszeichen, Schritt-für-Schritt-Anleitungen, typische Fehler und Quizfragen.',
    textEn: 'Combines guided learning points, typical exam scenarios, traffic signs, step-by-step guidance, common mistakes, and quizzes.',
  },
  {
    nameDe: 'Manöver-Schnellansicht',
    nameEn: 'Maneuver quick reference',
    textDe: 'Bietet schnelle Wiederholung von Einparken, Wenden, Gefahrenbremsung und animierten Visualisierungen.',
    textEn: 'Provides quick review of parking, turning, emergency braking, and animated visualizations.',
  },
  {
    nameDe: 'Fahrtenbuch / Tracker',
    nameEn: 'Logbook / Tracker',
    textDe: 'Erfasst Normalfahrten und Sonderfahrten, zeigt Soll/Ist-Stände und behandelt Umschreibung ohne gesetzliche Pflichtstunden separat.',
    textEn: 'Tracks normal and special drives, shows target/actual values, and handles conversion cases separately without legal mandatory hours.',
  },
];

function renderStepList(steps: ManeuverStep[] | undefined, isDE: boolean) {
  if (!steps || steps.length === 0) return null;

  return (
    <ol className="mt-3 space-y-2">
      {steps.map((step) => (
        <li key={step.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {step.id}
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDE ? step.titleDe : step.titleEn}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE ? step.descriptionDe : step.descriptionEn}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function renderTips(tips: Tip[] | undefined, isDE: boolean) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="mt-3 grid gap-3">
      {tips.map((tip) => (
        <div key={tip.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {isDE ? tip.titleDe : tip.titleEn}
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-100/90">
            {isDE ? tip.contentDe : tip.contentEn}
          </p>
        </div>
      ))}
    </div>
  );
}

function addPdfWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageHeight: number,
  bottomMargin: number
) {
  const lines = pdf.splitTextToSize(text, maxWidth) as string[];
  let cursorY = y;

  lines.forEach((line) => {
    if (cursorY > pageHeight - bottomMargin) {
      pdf.addPage();
      cursorY = 20;
    }
    pdf.text(line, x, cursorY);
    cursorY += lineHeight;
  });

  return cursorY;
}

function addPdfSectionTitle(pdf: jsPDF, title: string, y: number, pageHeight: number, bottomMargin: number) {
  let cursorY = y;
  if (cursorY > pageHeight - bottomMargin - 12) {
    pdf.addPage();
    cursorY = 20;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(title, 14, cursorY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  return cursorY + 8;
}

function LessonPacket({ lesson, isDE }: { lesson: Lesson; isDE: boolean }) {
  return (
    <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            {isDE ? 'Beispiellektion' : 'Sample lesson'}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {isDE ? lesson.titleDe : lesson.titleEn}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {isDE ? lesson.descriptionDe : lesson.descriptionEn}
          </p>
        </div>
      </div>

      {lesson.trafficSigns && lesson.trafficSigns.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Relevante Zeichen / Visuals' : 'Relevant signs / visuals'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.trafficSigns.map((sign) => (
              <span key={sign.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {sign.code ? `${sign.code} · ` : ''}{isDE ? sign.titleDe : sign.titleEn}
              </span>
            ))}
          </div>
        </div>
      )}

      {lesson.guidedPoints && lesson.guidedPoints.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Geführte Lernpunkte' : 'Guided learning points'}
          </h4>
          <div className="mt-3 grid gap-3">
            {lesson.guidedPoints.map((point) => (
              <div key={point.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {isDE ? point.titleDe : point.titleEn}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isDE ? point.contentDe : point.contentEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.steps && lesson.steps.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Schritt-für-Schritt-Anleitung' : 'Step-by-step instructions'}
          </h4>
          {renderStepList(lesson.steps, isDE)}
        </div>
      )}

      {lesson.scenarios && lesson.scenarios.length > 0 && (
        <div className="mt-5 space-y-4">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Prüfungsszenarien' : 'Exam scenarios'}
          </h4>
          {lesson.scenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDE ? scenario.titleDe : scenario.titleEn}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE ? scenario.situationDe : scenario.situationEn}
              </p>
              {renderStepList(scenario.steps, isDE)}
              {renderTips(scenario.mistakes, isDE)}
            </div>
          ))}
        </div>
      )}

      {lesson.tips && lesson.tips.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Dozenten-/Prüfungshinweise' : 'Instructor / exam notes'}
          </h4>
          {renderTips(lesson.tips, isDE)}
        </div>
      )}
    </section>
  );
}

export function InstructorReview({ onBack }: InstructorReviewProps) {
  const { language, licenseType, userProgress, removeMistake } = useAppStore();
  const isDE = language === 'de';
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const myMistakes = useMemo(() => {
    return (userProgress.incorrectQuestions || [])
      .map(id => scenarios.find(s => s.id === id))
      .filter(Boolean);
  }, [userProgress.incorrectQuestions]);

  const sampleLessons = sampleLessonIds
    .map((id) => getLessonById(id))
    .filter(Boolean) as Lesson[];

  const maneuverLessons = maneuverLessonIds
    .map((id) => getLessonById(id))
    .filter(Boolean) as Lesson[];

  const quizQuestions = getAllLessons()
    .flatMap((lesson) =>
      (lesson.quiz ?? []).map((question) => ({
        lessonTitle: isDE ? lesson.titleDe : lesson.titleEn,
        lessonCategory: isDE ? lesson.descriptionDe : lesson.descriptionEn,
        question,
      }))
    )
    .slice(0, 8);

  const selectionLabel =
    licenseType === 'umschreibung-manual'
      ? isDE
        ? 'Umschreibung · Schaltgetriebe'
        : 'Conversion · Manual'
      : licenseType === 'umschreibung-automatic'
        ? isDE
          ? 'Umschreibung · Automatik'
          : 'Conversion · Automatic'
        : licenseType === 'manual'
          ? isDE
            ? 'Neuer Führerschein · Schaltgetriebe'
            : 'New License · Manual'
          : isDE
            ? 'Neuer Führerschein · Automatik'
            : 'New License · Automatic';

  const buildReviewPdf = () => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const left = 14;
    const right = 14;
    const contentWidth = pageWidth - left - right;
    const bottomMargin = 18;
    let y = 20;

    const addBody = (text: string, indent = 0, lineHeight = 6) => {
      y = addPdfWrappedText(pdf, text, left + indent, y, contentWidth - indent, lineHeight, pageHeight, bottomMargin);
    };

    const addSpacer = (amount = 4) => {
      y += amount;
      if (y > pageHeight - bottomMargin) {
        pdf.addPage();
        y = 20;
      }
    };

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(isDE ? 'DriveDE – Fahrlehrer-Review-Paket' : 'DriveDE – Instructor Review Pack', left, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    addBody(`${isDE ? 'Aktive Auswahl' : 'Active selection'}: ${selectionLabel}`);
    addBody(
      isDE
        ? 'Diese PDF bündelt Lehrplan, Beispiellektionen, Manöver-Anleitungen, Bewertungsraster, UX-Beschreibung und Quizfragen für die fachliche Prüfung durch einen deutschen Fahrlehrer.'
        : 'This PDF bundles curriculum, sample lessons, maneuver instructions, assessment rubric, UX descriptions, and quiz questions for professional review by a German driving instructor.'
    );
    addSpacer(6);

    y = addPdfSectionTitle(pdf, isDE ? '1. Modulübersicht / Table of Contents' : '1. Module list / table of contents', y, pageHeight, bottomMargin);
    chapters.forEach((chapter) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      addBody(`${chapter.id} – ${isDE ? chapter.titleDe : chapter.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(isDE ? chapter.descriptionDe : chapter.descriptionEn, 4);
      chapter.lessons.forEach((lesson) => {
        addBody(`• ${lesson.id} — ${isDE ? lesson.titleDe : lesson.titleEn}`, 6);
      });
      addSpacer(3);
    });

    y = addPdfSectionTitle(pdf, isDE ? '2. Volltext von 3 Beispiellektionen' : '2. Full text of 3 sample lessons', y, pageHeight, bottomMargin);
    sampleLessons.forEach((lesson, index) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      addBody(`${index + 1}. ${isDE ? lesson.titleDe : lesson.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(isDE ? lesson.descriptionDe : lesson.descriptionEn, 4);

      if (lesson.guidedPoints?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(isDE ? 'Geführte Lernpunkte:' : 'Guided learning points:', 4);
        pdf.setFont('helvetica', 'normal');
        lesson.guidedPoints.forEach((point) => {
          addBody(`• ${isDE ? point.titleDe : point.titleEn}: ${isDE ? point.contentDe : point.contentEn}`, 8);
        });
      }

      if (lesson.steps?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(isDE ? 'Schritt-für-Schritt:' : 'Step-by-step:', 4);
        pdf.setFont('helvetica', 'normal');
        lesson.steps.forEach((step) => {
          addBody(`${step.id}. ${isDE ? step.titleDe : step.titleEn} — ${isDE ? step.descriptionDe : step.descriptionEn}`, 8);
        });
      }

      if (lesson.scenarios?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(isDE ? 'Prüfungsszenarien:' : 'Exam scenarios:', 4);
        pdf.setFont('helvetica', 'normal');
        lesson.scenarios.forEach((scenario) => {
          addBody(`• ${isDE ? scenario.titleDe : scenario.titleEn}`, 8);
          addBody(isDE ? scenario.situationDe : scenario.situationEn, 12);
        });
      }

      if (lesson.tips?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(isDE ? 'Dozenten-/Prüfungshinweise:' : 'Instructor / exam notes:', 4);
        pdf.setFont('helvetica', 'normal');
        lesson.tips.forEach((tip) => {
          addBody(`• ${isDE ? tip.titleDe : tip.titleEn}: ${isDE ? tip.contentDe : tip.contentEn}`, 8);
        });
      }

      addSpacer(5);
    });

    y = addPdfSectionTitle(pdf, isDE ? '3. Manöver-Anleitungen & Referenzpunkte' : '3. Maneuver instructions & reference points', y, pageHeight, bottomMargin);
    maneuverLessons.forEach((lesson) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      addBody(`${isDE ? lesson.titleDe : lesson.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(isDE ? lesson.descriptionDe : lesson.descriptionEn, 4);
      lesson.steps?.forEach((step) => {
        addBody(`${step.id}. ${isDE ? step.titleDe : step.titleEn} — ${isDE ? step.descriptionDe : step.descriptionEn}`, 8);
      });
      addSpacer(3);
    });

    y = addPdfSectionTitle(pdf, isDE ? '4. Bewertungsraster / Review Rubric' : '4. Review rubric / assessment lens', y, pageHeight, bottomMargin);
    rubricItems.forEach((item) => {
      pdf.setFont('helvetica', 'bold');
      addBody(`${isDE ? item.areaDe : item.areaEn}`);
      pdf.setFont('helvetica', 'normal');
      addBody(`${isDE ? 'Darauf achten' : 'What to review'}: ${isDE ? item.checkDe : item.checkEn}`, 4);
      addBody(`${isDE ? 'Typisches Risiko' : 'Typical risk'}: ${isDE ? item.riskDe : item.riskEn}`, 4);
      addSpacer(2);
    });

    y = addPdfSectionTitle(pdf, isDE ? '5. Screen Descriptions' : '5. Screen descriptions', y, pageHeight, bottomMargin);
    screenDescriptions.forEach((screen) => {
      pdf.setFont('helvetica', 'bold');
      addBody(`${isDE ? screen.nameDe : screen.nameEn}`);
      pdf.setFont('helvetica', 'normal');
      addBody(isDE ? screen.textDe : screen.textEn, 4);
      addSpacer(2);
    });

    y = addPdfSectionTitle(pdf, isDE ? '6. Quiz- / Testfragen' : '6. Quiz / test questions', y, pageHeight, bottomMargin);
    quizQuestions.forEach(({ lessonTitle, lessonCategory, question }) => {
      const correct = question.options.find((option) => option.id === question.correctOptionId);
      pdf.setFont('helvetica', 'bold');
      addBody(`${lessonTitle}`);
      pdf.setFont('helvetica', 'normal');
      addBody(`${lessonCategory}`, 4);
      pdf.setFont('helvetica', 'bold');
      addBody(`${isDE ? question.questionDe : question.questionEn}`, 4);
      pdf.setFont('helvetica', 'normal');
      question.options.forEach((option) => {
        addBody(`${option.id.toUpperCase()}. ${isDE ? option.textDe : option.textEn}`, 8);
      });
      if (correct) {
        addBody(`${isDE ? 'Richtige Antwort' : 'Correct answer'}: ${correct.id.toUpperCase()}. ${isDE ? correct.textDe : correct.textEn}`, 8);
        addBody(isDE ? question.explanationDe : question.explanationEn, 12);
      }
      addSpacer(3);
    });

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i += 1) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`DriveDE · ${selectionLabel}`, left, pageHeight - 8);
      pdf.text(`${i}/${totalPages}`, pageWidth - right - 10, pageHeight - 8);
    }

    return pdf;
  };

  const handlePrintReview = () => {
    try {
      const pdf = buildReviewPdf();
      pdf.autoPrint();
      const blobUrl = pdf.output('bloburl');
      const printWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!printWindow) {
        window.alert(
          isDE
            ? 'Das Druckfenster konnte nicht geöffnet werden. Bitte erlauben Sie Pop-ups für diese Seite.'
            : 'The print window could not be opened. Please allow pop-ups for this page.'
        );
        return;
      }

      printWindow.focus();
    } catch (error) {
      console.error('Print export failed', error);
      window.alert(isDE ? 'Druckansicht konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' : 'The print view could not be created. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const pdf = buildReviewPdf();
      const filename = `DriveDE-Instructor-Review-${licenseType ?? 'default'}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed', error);
      window.alert(isDE ? 'PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' : 'The PDF could not be created. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="print-document space-y-6 pb-10 print:pb-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <PageHeader title={isDE ? 'Fahrlehrer-Review' : 'Instructor Review'} onBack={onBack} />

        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={handlePrintReview}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">{isDE ? 'Drucken' : 'Print'}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isDownloadingPdf ? (isDE ? 'Wird erstellt…' : 'Generating…') : isDE ? 'PDF laden' : 'Download PDF'}
            </span>
          </button>
        </div>
      </div>

      <div ref={documentRef} className="space-y-6 bg-white px-4 print:bg-white dark:print:bg-white sm:px-0">
        <section className="print-section print-no-shadow rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-xl print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                {isDE ? 'Fahrlehrer-Review-Paket' : 'Instructor review pack'}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                {isDE ? 'DriveDE – Unterlagen zur fachlichen Prüfung' : 'DriveDE – materials for professional review'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
                {isDE
                  ? 'Diese Zusammenstellung bündelt genau die Unterlagen, die ein deutscher Fahrlehrer typischerweise für eine fachliche Beurteilung braucht: Lehrplan, Beispiellektionen, Manöver-Anleitungen, Bewertungsraster, UX-Beschreibung und Quizfragen.'
                  : 'This package bundles exactly the materials a German driving instructor typically needs for a professional review: curriculum, sample lessons, maneuver instructions, assessment rubric, UX descriptions, and quiz questions.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
              <p className="text-blue-100">{isDE ? 'Aktive Auswahl' : 'Active selection'}</p>
              <p className="mt-1 font-semibold text-white">{selectionLabel}</p>
            </div>
          </div>
        </section>

        {myMistakes.length > 0 && (
          <section className="print:hidden rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isDE ? 'Meine Fehler-Korrektur' : 'My Mistake Review'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isDE 
                      ? `${myMistakes.length} Szenarien warten auf Wiederholung.` 
                      : `${myMistakes.length} scenarios waiting for review.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {myMistakes.map((scenario) => {
                if (!scenario) return null;
                const correctOption = scenario.options.find(o => o.id === scenario.correctId);
                
                return (
                  <div key={scenario.id} className="group relative rounded-2xl border border-white bg-white/60 p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60">
                    <button
                      onClick={() => removeMistake(scenario.id)}
                      className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      title={isDE ? 'Als gelernt markieren' : 'Mark as learned'}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {isDE ? scenario.titleDe : scenario.titleEn}
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl bg-slate-100/50 p-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          {isDE ? 'Situation:' : 'Situation:'}
                        </p>
                        {isDE ? scenario.situationDe : scenario.situationEn}
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                          {isDE ? 'Richtige Antwort:' : 'Correct Answer:'}
                        </p>
                        <p className="text-emerald-900 dark:text-emerald-200">
                          {isDE ? correctOption?.textDe : correctOption?.textEn}
                        </p>
                        <p className="mt-2 text-xs italic opacity-80">
                          {isDE ? scenario.explanationDe : scenario.explanationEn}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? 'Was Sie Ihrem Fahrlehrer teilen können' : 'What you can share with your instructor'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Direkt aus der App druckbar oder als PDF speicherbar.' : 'Can be printed directly from the app or saved as a PDF.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              isDE ? '1. Dieses Review-Paket als PDF exportieren' : '1. Export this review pack as PDF',
              isDE ? '2. Den App-Link plus 3–5 Screenshots mitschicken' : '2. Send the app link plus 3–5 screenshots',
              isDE ? '3. Fahrlehrer gezielt um StVO-, Didaktik- und Prüfungsfeedback bitten' : '3. Ask for focused feedback on StVO accuracy, didactics, and exam realism',
              isDE ? '4. Korrekturen nach Priorität 1 → 2 → 3 einarbeiten' : '4. Implement changes in priority order 1 → 2 → 3',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '1. Modulübersicht / Table of Contents' : '1. Module list / table of contents'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur Bewertung der didaktischen Reihenfolge.' : 'For evaluating didactic sequencing.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  {chapter.id}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {isDE ? chapter.titleDe : chapter.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isDE ? chapter.descriptionDe : chapter.descriptionEn}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span><strong>{lesson.id}</strong> — {isDE ? lesson.titleDe : lesson.titleEn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="print-section space-y-4 print:break-before-page">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '2. Volltext von 3 Beispiellektionen' : '2. Full text of 3 sample lessons'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur Prüfung von StVO-Genauigkeit, Tiefe und Struktur.' : 'For reviewing StVO accuracy, depth, and structure.'}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {sampleLessons.map((lesson) => (
              <LessonPacket key={lesson.id} lesson={lesson} isDE={isDE} />
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <CarFront className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '3. Manöver-Anleitungen & Referenzpunkte' : '3. Maneuver instructions & reference points'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur fachlichen Prüfung von Reihenfolge, Blicktechnik und Referenzpunkten.' : 'For verifying maneuver steps, observation order, and reference points.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {maneuverLessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isDE ? lesson.titleDe : lesson.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isDE ? lesson.descriptionDe : lesson.descriptionEn}
                </p>
                {renderStepList(lesson.steps, isDE)}
              </div>
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '4. Bewertungsraster / Review Rubric' : '4. Review rubric / assessment lens'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur Einordnung gegenüber realen TÜV/DEKRA-Kriterien.' : 'To compare the app against real TÜV/DEKRA assessment expectations.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {rubricItems.map((item) => (
              <div key={item.areaEn} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isDE ? item.areaDe : item.areaEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isDE ? 'Darauf achten:' : 'What to review:'}
                  </span>{' '}
                  {isDE ? item.checkDe : item.checkEn}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isDE ? 'Typisches Risiko:' : 'Typical risk:'}
                  </span>{' '}
                  {isDE ? item.riskDe : item.riskEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '5. Screenshots / Screen Descriptions' : '5. Screenshots / screen descriptions'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur Bewertung von UX, Klarheit und pädagogischer Führung.' : 'For evaluating UX clarity and pedagogical quality.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {screenDescriptions.map((screen) => (
              <div key={screen.nameEn} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isDE ? screen.nameDe : screen.nameEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isDE ? screen.textDe : screen.textEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? '6. Quiz- / Testfragen' : '6. Quiz / test questions'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zur Prüfung juristischer und technischer Korrektheit.' : 'For verifying legal and technical correctness.'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {quizQuestions.map(({ lessonTitle, lessonCategory, question }) => {
              const correct = question.options.find((option) => option.id === question.correctOptionId);
              return (
                <div key={question.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                    {lessonTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {lessonCategory}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {isDE ? question.questionDe : question.questionEn}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {question.options.map((option) => (
                      <li key={option.id}>
                        <span className="font-semibold">{option.id.toUpperCase()}.</span>{' '}
                        {isDE ? option.textDe : option.textEn}
                      </li>
                    ))}
                  </ul>
                  {correct && (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
                      <p className="font-semibold">
                        {isDE ? 'Richtige Antwort' : 'Correct answer'}: {correct.id.toUpperCase()}. {isDE ? correct.textDe : correct.textEn}
                      </p>
                      <p className="mt-1 leading-6">{isDE ? question.explanationDe : question.explanationEn}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
