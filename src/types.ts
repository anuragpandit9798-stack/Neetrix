export type SubjectType = 'Physics' | 'Chemistry' | 'Biology' | 'General';

export interface MorningStudyState {
  wakeUpOnTime: boolean;
  bioNcertDone: boolean;
  bioQuestions: number;
  physicsDone: boolean;
  physicsConcepts: string;
  physicsNumericals: number;
  chemistryOrganic: boolean;
  chemistryPhysical: boolean;
  chemistryInorganic: boolean;
  revisionDone: 'Yes' | 'No';
}

export interface DisciplineState {
  sleepHrs: boolean;
  noSocialMedia: boolean;
}

export interface DailyPracticeState {
  bioMcqs: number;
  physicsMcqs: number;
  chemistryMcqs: number;
}

export interface ClassState {
  attended: boolean;
  notesMade: boolean;
  doubtsMarked: boolean;
  attentionMaintained: boolean;
}

export interface NightRevisionState {
  classRevision: boolean;
  morningRevision: boolean;
  errorUpdated: boolean;
  lightMcqs: boolean;
}

export interface DailyLog {
  id: string; // YYYY-MM-DD
  date: string;
  studyHours: number;
  morningStudy: MorningStudyState;
  discipline: DisciplineState;
  dailyPractice: DailyPracticeState;
  classActivity: ClassState;
  nightRevision: NightRevisionState;
  improvementScore: number; // 0-100 calculated score
  submittedAt: string; // ISO timestamp
}

export interface ErrorEntry {
  id: string;
  date: string;
  subject: SubjectType;
  topic: string;
  mistake: string;
  reason: string;
  improvementPlan: string;
  reviewed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TrackerStats {
  streak: number;
  bestStreak: number;
  lastSubmitDate: string | null;
  totalStudyHours: number;
  totalMcqsSolved: number;
  overallImprovement: number;
}
