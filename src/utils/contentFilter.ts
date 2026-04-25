/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { Chapter, Lesson, LearningPathType, TransmissionType } from '../types';

export const isLessonVisibleForTransmission = (
  lesson: Lesson,
  transmissionType: TransmissionType
) => {
  if (!transmissionType) return false;
  if (lesson.manualOnly) return transmissionType === 'manual';
  if (lesson.automaticOnly) return transmissionType === 'automatic';
  return true;
};

export const isLessonVisibleForLearningPath = (
  lesson: Lesson,
  learningPath: LearningPathType
) => {
  if (!learningPath) return false;
  if (!lesson.learningPath || lesson.learningPath === 'both') return true;
  return lesson.learningPath === learningPath;
};

export const isLessonVisible = (
  lesson: Lesson,
  transmissionType: TransmissionType,
  learningPath: LearningPathType
) => {
  return (
    isLessonVisibleForTransmission(lesson, transmissionType) &&
    isLessonVisibleForLearningPath(lesson, learningPath)
  );
};

export const filterLessonsForSelection = (
  lessons: Lesson[],
  transmissionType: TransmissionType,
  learningPath: LearningPathType
) => {
  return lessons.filter((lesson) => isLessonVisible(lesson, transmissionType, learningPath));
};

export const filterLessonsForTransmission = (
  lessons: Lesson[],
  transmissionType: TransmissionType
) => {
  return lessons.filter((lesson) => isLessonVisibleForTransmission(lesson, transmissionType));
};

export const filterChaptersForSelection = (
  chapters: Chapter[],
  transmissionType: TransmissionType,
  learningPath: LearningPathType
): Chapter[] => {
  return chapters.map((chapter) => ({
    ...chapter,
    lessons: filterLessonsForSelection(chapter.lessons, transmissionType, learningPath),
  }));
};

export const filterChaptersForTransmission = (
  chapters: Chapter[],
  transmissionType: TransmissionType
): Chapter[] => {
  return chapters.map((chapter) => ({
    ...chapter,
    lessons: filterLessonsForTransmission(chapter.lessons, transmissionType),
  }));
};
