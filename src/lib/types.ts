export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  importedAt: string;
  status: "pending" | "sent" | "opened" | "completed";
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  contactCount: number;
  sentCount: number;
  openedCount: number;
  completedCount: number;
  positiveCount: number;
  negativeCount: number;
  createdAt: string;
  status: "draft" | "sending" | "sent" | "completed";
}

export interface SurveyResponse {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  answers: number[];
  averageScore: number;
  isPositive: boolean;
  redirectedToGoogle: boolean;
  completedAt: string;
}

export interface SurveyQuestion {
  id: number;
  text: string;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: 1, text: "Comment évaluez-vous la qualité de l'accueil au centre ?" },
  { id: 2, text: "Les explications fournies par l'équipe étaient-elles claires ?" },
  { id: 3, text: "Êtes-vous satisfait(e) du déroulement du bilan de votre enfant ?" },
  { id: 4, text: "Le rapport et les recommandations vous ont-ils semblé utiles ?" },
  { id: 5, text: "Recommanderiez-vous Novadev à d'autres parents ?" },
];

export const POSITIVE_THRESHOLD = 4;
