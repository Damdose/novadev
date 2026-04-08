import { Campaign, Contact, SurveyResponse } from "./types";

export const mockContacts: Contact[] = [
  { id: "1", firstName: "Marie", lastName: "Dupont", email: "marie.dupont@email.com", phone: "06 12 34 56 78", importedAt: "2026-04-01", status: "completed" },
  { id: "2", firstName: "Thomas", lastName: "Martin", email: "thomas.martin@email.com", importedAt: "2026-04-01", status: "sent" },
  { id: "3", firstName: "Sophie", lastName: "Bernard", email: "sophie.bernard@email.com", phone: "06 98 76 54 32", importedAt: "2026-04-02", status: "completed" },
  { id: "4", firstName: "Lucas", lastName: "Petit", email: "lucas.petit@email.com", importedAt: "2026-04-02", status: "opened" },
  { id: "5", firstName: "Emma", lastName: "Robert", email: "emma.robert@email.com", phone: "06 11 22 33 44", importedAt: "2026-04-03", status: "pending" },
  { id: "6", firstName: "Hugo", lastName: "Richard", email: "hugo.richard@email.com", importedAt: "2026-04-03", status: "sent" },
  { id: "7", firstName: "Léa", lastName: "Durand", email: "lea.durand@email.com", phone: "06 55 66 77 88", importedAt: "2026-04-04", status: "completed" },
  { id: "8", firstName: "Nathan", lastName: "Moreau", email: "nathan.moreau@email.com", importedAt: "2026-04-05", status: "pending" },
];

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Campagne Avril - Semaine 1",
    subject: "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?",
    contactCount: 24,
    sentCount: 24,
    openedCount: 18,
    completedCount: 14,
    positiveCount: 11,
    negativeCount: 3,
    createdAt: "2026-04-01",
    status: "completed",
  },
  {
    id: "2",
    name: "Campagne Avril - Semaine 2",
    subject: "Novadev souhaite recueillir votre avis",
    contactCount: 16,
    sentCount: 16,
    openedCount: 9,
    completedCount: 5,
    positiveCount: 4,
    negativeCount: 1,
    createdAt: "2026-04-07",
    status: "sent",
  },
];

export const mockResponses: SurveyResponse[] = [
  { id: "1", campaignId: "1", contactId: "1", contactName: "Marie Dupont", contactEmail: "marie.dupont@email.com", answers: [5, 5, 4, 5, 5], averageScore: 4.8, isPositive: true, redirectedToGoogle: true, completedAt: "2026-04-02" },
  { id: "2", campaignId: "1", contactId: "3", contactName: "Sophie Bernard", contactEmail: "sophie.bernard@email.com", answers: [4, 4, 5, 4, 5], averageScore: 4.4, isPositive: true, redirectedToGoogle: true, completedAt: "2026-04-03" },
  { id: "3", campaignId: "1", contactId: "7", contactName: "Léa Durand", contactEmail: "lea.durand@email.com", answers: [3, 2, 3, 3, 2], averageScore: 2.6, isPositive: false, redirectedToGoogle: false, completedAt: "2026-04-05" },
  { id: "4", campaignId: "1", contactId: "4", contactName: "Lucas Petit", contactEmail: "lucas.petit@email.com", answers: [5, 4, 5, 5, 5], averageScore: 4.8, isPositive: true, redirectedToGoogle: true, completedAt: "2026-04-03" },
  { id: "5", campaignId: "2", contactId: "2", contactName: "Thomas Martin", contactEmail: "thomas.martin@email.com", answers: [5, 5, 5, 4, 5], averageScore: 4.8, isPositive: true, redirectedToGoogle: true, completedAt: "2026-04-08" },
];
