export interface Question {
  id: string;
  type: 'choice' | 'fill' | 'essay';
  content: string; // Markdown & LaTeX
  options?: string[]; // Choice only
  answer: string;
  explanation: string;
}

export interface Paper {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface StudentRecord {
  id: string;
  paperId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>;
  score?: number;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  paper?: Paper; // Attached paper when generation is complete
}

export interface GeneratePaperRequest {
  topic: string;
  grade: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes?: ('choice' | 'fill' | 'essay')[];
}
