/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useRef, useState, useMemo } from 'react';
import { BookOpenText, CarFront, ClipboardCheck, Download, FileText, MonitorSmartphone, Printer, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppStore } from '../../store/useAppStore';
import { chapters, getAllLessons, getLessonById } from '../../data/curriculum';
import { scenarios } from '../../data/scenarios';
import { PageHeader } from '../layout/PageHeader';
import { TRANSLATIONS } from '../../data/translations';
import type { Lesson, ManeuverStep, Tip } from '../../types';

interface InstructorReviewProps {
  onBack: () => void;
  onOpenPaywall?: () => void;
}

const sampleLessonIds = ['basics-1a', 'city-2', 'maneuver-1'];
const maneuverLessonIds = ['maneuver-1', 'maneuver-2', 'maneuver-3', 'maneuver-4', 'city-2', 'city-6'];

function renderStepList(steps: ManeuverStep[] | undefined, language: 'de' | 'en') {
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
                {language === 'de' ? step.titleDe : step.titleEn}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {language === 'de' ? step.descriptionDe : step.descriptionEn}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function renderTips(tips: Tip[] | undefined, language: 'de' | 'en') {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="mt-3 grid gap-3">
      {tips.map((tip) => (
        <div key={tip.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {language === 'de' ? tip.titleDe : tip.titleEn}
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-100/90">
            {language === 'de' ? tip.contentDe : tip.contentEn}
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

function LessonPacket({ lesson, language, xt }: { lesson: Lesson; language: 'de' | 'en'; xt: any }) {
  return (
    <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            {xt.sampleLesson}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {language === 'de' ? lesson.titleDe : lesson.titleEn}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {language === 'de' ? lesson.descriptionDe : lesson.descriptionEn}
          </p>
        </div>
      </div>

      {lesson.trafficSigns && lesson.trafficSigns.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {xt.relevantSigns}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.trafficSigns.map((sign) => (
              <span key={sign.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {sign.code ? `${sign.code} · ` : ''}{language === 'de' ? sign.titleDe : sign.titleEn}
              </span>
            ))}
          </div>
        </div>
      )}

      {lesson.guidedPoints && lesson.guidedPoints.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {xt.guidedPoints}
          </h4>
          <div className="mt-3 grid gap-3">
            {lesson.guidedPoints.map((point) => (
              <div key={point.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {language === 'de' ? point.titleDe : point.titleEn}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === 'de' ? point.contentDe : point.contentEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.steps && lesson.steps.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {xt.stepByStep}
          </h4>
          {renderStepList(lesson.steps, language)}
        </div>
      )}

      {lesson.scenarios && lesson.scenarios.length > 0 && (
        <div className="mt-5 space-y-4">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {xt.examScenarios}
          </h4>
          {lesson.scenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">
                {language === 'de' ? scenario.titleDe : scenario.titleEn}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {language === 'de' ? scenario.situationDe : scenario.situationEn}
              </p>
              {renderStepList(scenario.steps, language)}
              {renderTips(scenario.mistakes, language)}
            </div>
          ))}
        </div>
      )}

      {lesson.tips && lesson.tips.length > 0 && (
        <div className="mt-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {xt.instructorNotes}
          </h4>
          {renderTips(lesson.tips, language)}
        </div>
      )}
    </section>
  );
}

export function InstructorReview({ onBack, onOpenPaywall }: InstructorReviewProps) {
  const { language, licenseType, userProgress, removeMistake, isPremium } = useAppStore();
  const t = TRANSLATIONS[language];
  const xt = t.instructor;
  
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
        lessonTitle: language === 'de' ? lesson.titleDe : lesson.titleEn,
        lessonCategory: language === 'de' ? lesson.descriptionDe : lesson.descriptionEn,
        question,
      }))
    )
    .slice(0, 8);

  const selectionLabel = xt.licenseTypes[licenseType as keyof typeof xt.licenseTypes] || licenseType;

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
    pdf.text(xt.pdfTitle, left, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    addBody(`${xt.pdfActiveSelection}: ${selectionLabel}`);
    addBody(xt.pdfIntro);
    addSpacer(6);

    y = addPdfSectionTitle(pdf, xt.pdfSection1, y, pageHeight, bottomMargin);
    chapters.forEach((chapter) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      addBody(`${chapter.id} – ${language === 'de' ? chapter.titleDe : chapter.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(language === 'de' ? chapter.descriptionDe : chapter.descriptionEn, 4);
      chapter.lessons.forEach((lesson) => {
        addBody(`• ${lesson.id} — ${language === 'de' ? lesson.titleDe : lesson.titleEn}`, 6);
      });
      addSpacer(3);
    });

    y = addPdfSectionTitle(pdf, xt.pdfSection2, y, pageHeight, bottomMargin);
    sampleLessons.forEach((lesson, index) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      addBody(`${index + 1}. ${language === 'de' ? lesson.titleDe : lesson.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(language === 'de' ? lesson.descriptionDe : lesson.descriptionEn, 4);

      if (lesson.guidedPoints?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(`${xt.guidedPoints}:`, 4);
        pdf.setFont('helvetica', 'normal');
        lesson.guidedPoints.forEach((point) => {
          addBody(`• ${language === 'de' ? point.titleDe : point.titleEn}: ${language === 'de' ? point.contentDe : point.contentEn}`, 8);
        });
      }

      if (lesson.steps?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(`${xt.stepByStep}:`, 4);
        pdf.setFont('helvetica', 'normal');
        lesson.steps.forEach((step) => {
          addBody(`${step.id}. ${language === 'de' ? step.titleDe : step.titleEn} — ${language === 'de' ? step.descriptionDe : step.descriptionEn}`, 8);
        });
      }

      if (lesson.scenarios?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(`${xt.examScenarios}:`, 4);
        pdf.setFont('helvetica', 'normal');
        lesson.scenarios.forEach((scenario) => {
          addBody(`• ${language === 'de' ? scenario.titleDe : scenario.titleEn}`, 8);
          addBody(language === 'de' ? scenario.situationDe : scenario.situationEn, 12);
        });
      }

      if (lesson.tips?.length) {
        pdf.setFont('helvetica', 'bold');
        addBody(`${xt.instructorNotes}:`, 4);
        pdf.setFont('helvetica', 'normal');
        lesson.tips.forEach((tip) => {
          addBody(`• ${language === 'de' ? tip.titleDe : tip.titleEn}: ${language === 'de' ? tip.contentDe : tip.contentEn}`, 8);
        });
      }

      addSpacer(5);
    });

    y = addPdfSectionTitle(pdf, xt.pdfSection3, y, pageHeight, bottomMargin);
    maneuverLessons.forEach((lesson) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      addBody(`${language === 'de' ? lesson.titleDe : lesson.titleEn}`);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addBody(language === 'de' ? lesson.descriptionDe : lesson.descriptionEn, 4);
      lesson.steps?.forEach((step) => {
        addBody(`${step.id}. ${language === 'de' ? step.titleDe : step.titleEn} — ${language === 'de' ? step.descriptionDe : step.descriptionEn}`, 8);
      });
      addSpacer(3);
    });

    y = addPdfSectionTitle(pdf, xt.pdfSection4, y, pageHeight, bottomMargin);
    xt.rubricItems.forEach((item: any) => {
      pdf.setFont('helvetica', 'bold');
      addBody(`${item.area}`);
      pdf.setFont('helvetica', 'normal');
      addBody(`${xt.whatToReview} ${item.check}`, 4);
      addBody(`${xt.typicalRisk} ${item.risk}`, 4);
      addSpacer(2);
    });

    y = addPdfSectionTitle(pdf, xt.pdfSection5, y, pageHeight, bottomMargin);
    xt.screenDescriptions.forEach((screen: any) => {
      pdf.setFont('helvetica', 'bold');
      addBody(`${screen.name}`);
      pdf.setFont('helvetica', 'normal');
      addBody(screen.text, 4);
      addSpacer(2);
    });

    y = addPdfSectionTitle(pdf, xt.pdfSection6, y, pageHeight, bottomMargin);
    quizQuestions.forEach(({ lessonTitle, lessonCategory, question }) => {
      const correct = question.options.find((option) => option.id === question.correctOptionId);
      pdf.setFont('helvetica', 'bold');
      addBody(`${lessonTitle}`);
      pdf.setFont('helvetica', 'normal');
      addBody(`${lessonCategory}`, 4);
      pdf.setFont('helvetica', 'bold');
      addBody(`${language === 'de' ? question.questionDe : question.questionEn}`, 4);
      pdf.setFont('helvetica', 'normal');
      question.options.forEach((option) => {
        addBody(`${option.id.toUpperCase()}. ${language === 'de' ? option.textDe : option.textEn}`, 8);
      });
      if (correct) {
        addBody(`${xt.pdfCorrectAnswer}: ${correct.id.toUpperCase()}. ${language === 'de' ? correct.textDe : correct.textEn}`, 8);
        addBody(language === 'de' ? question.explanationDe : question.explanationEn, 12);
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
    if (!isPremium) {
      onOpenPaywall?.();
      return;
    }
    try {
      const pdf = buildReviewPdf();
      pdf.autoPrint();
      const blobUrl = pdf.output('bloburl');
      const printWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!printWindow) {
        window.alert(xt.popupError);
        return;
      }

      printWindow.focus();
    } catch (error) {
      console.error('Print export failed', error);
      window.alert(xt.printError);
    }
  };

  const handleDownloadPdf = async () => {
    if (!isPremium) {
      onOpenPaywall?.();
      return;
    }
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const pdf = buildReviewPdf();
      const filename = `DriveDE-Instructor-Review-${licenseType ?? 'default'}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed', error);
      window.alert(xt.pdfError);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="print-document space-y-6 pb-10 print:pb-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <PageHeader title={xt.title} onBack={onBack} />

        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={handlePrintReview}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {isPremium ? <Printer className="h-4 w-4" /> : <Lock className="h-4 w-4 text-amber-500" />}
            <span className="hidden sm:inline">{xt.print}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPremium ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isDownloadingPdf ? xt.generating : xt.downloadPdf}
            </span>
          </button>
        </div>
      </div>

      <div ref={documentRef} className="space-y-6 bg-white px-4 print:bg-white dark:print:bg-white sm:px-0">
        <section className="print-section print-no-shadow rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-xl print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                {xt.packTitle}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                {xt.packSubtitle}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
                {xt.packDesc}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
              <p className="text-blue-100">{xt.activeSelection}</p>
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
                    {xt.mistakeReview}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {xt.mistakesWaiting(myMistakes.length)}
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
                      title={xt.markAsLearned}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {language === 'de' ? scenario.titleDe : scenario.titleEn}
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl bg-slate-100/50 p-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          {xt.situation}
                        </p>
                        {language === 'de' ? scenario.situationDe : scenario.situationEn}
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                          {xt.correctAnswer}
                        </p>
                        <p className="text-emerald-900 dark:text-emerald-200">
                          {language === 'de' ? correctOption?.textDe : correctOption?.textEn}
                        </p>
                        <p className="mt-2 text-xs italic opacity-80">
                          {language === 'de' ? scenario.explanationDe : scenario.explanationEn}
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
                {xt.shareTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.shareDesc}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {xt.shareItems.map((item: string) => (
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
                {xt.section1Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section1Desc}
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
                  {language === 'de' ? chapter.titleDe : chapter.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === 'de' ? chapter.descriptionDe : chapter.descriptionEn}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span><strong>{lesson.id}</strong> — {language === 'de' ? lesson.titleDe : lesson.titleEn}</span>
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
                {xt.section2Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section2Desc}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {sampleLessons.map((lesson) => (
              <LessonPacket key={lesson.id} lesson={lesson} language={language} xt={xt} />
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
                {xt.section3Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section3Desc}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {maneuverLessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'de' ? lesson.titleDe : lesson.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {language === 'de' ? lesson.descriptionDe : lesson.descriptionEn}
                </p>
                {renderStepList(lesson.steps, language)}
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
                {xt.section4Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section4Desc}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {xt.rubricItems.map((item: any) => (
              <div key={item.area} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {item.area}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {xt.whatToReview}
                  </span>{' '}
                  {item.check}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {xt.typicalRisk}
                  </span>{' '}
                  {item.risk}
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
                {xt.section5Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section5Desc}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {xt.screenDescriptions.map((screen: any) => (
              <div key={screen.name} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {screen.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {screen.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-section print-no-shadow rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {xt.section6Title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {xt.section6Desc}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-6">
            {quizQuestions.map(({ lessonTitle, lessonCategory, question }, idx) => {
              const correct = question.options.find(o => o.id === question.correctOptionId);
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {lessonTitle}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">{lessonCategory}</p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'de' ? question.questionDe : question.questionEn}
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map(opt => (
                      <div key={opt.id} className={cn(
                        'rounded-xl border p-3 text-sm',
                        opt.id === question.correctOptionId 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300'
                          : 'border-slate-100 bg-slate-50/50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                      )}>
                        <span className="font-bold mr-2">{opt.id.toUpperCase()}</span>
                        {language === 'de' ? opt.textDe : opt.textEn}
                      </div>
                    ))}
                  </div>
                  {correct && (
                    <div className="mt-3 rounded-xl bg-blue-50/50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      <p className="font-bold mb-1">{xt.pdfCorrectAnswer}: {correct.id.toUpperCase()}</p>
                      {language === 'de' ? question.explanationDe : question.explanationEn}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
