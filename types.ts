
export interface RawQuestion {
  pergunta: string;
  resposta_correta: boolean;
  explicacao: string;
}

export interface ImportData {
  materia: string;
  subtopico: string;
  questoes: RawQuestion[];
}

export interface Question extends RawQuestion {
  id: string;
  subtopico: string;
}

export interface Subject {
  materia: string;
  questoes: Question[];
}

export type QuestionBank = Record<string, Subject>;

export type AppView = 'SETUP' | 'IMPORT' | 'QUIZ' | 'RESULTS';

export interface QuizSettings {
  materia: string;
  subtopico: string;
  numberOfQuestions: number;
}

export interface UserAnswer {
  question: Question;
  answer: boolean;
  isCorrect: boolean;
  timeTaken: number;
}

export interface QuizSession {
  questions: Question[];
  answers: UserAnswer[];
  startTime: number;
}

export interface QuizResults {
  answers: UserAnswer[];
  totalTime: number;
  settings: QuizSettings;
}
