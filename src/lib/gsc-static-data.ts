// Données statiques Google Search Console — export du 22/04/2026 (3 derniers mois)
// Utilisé en fallback tant que la connexion API n'est pas active

export interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDateRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// ─── Graphique (par date) ───────────────────────────────────

export const gscDailyData: GscDateRow[] = [
  { date: "2026-01-21", clicks: 13, impressions: 59, ctr: 22.03, position: 2.4 },
  { date: "2026-01-22", clicks: 18, impressions: 79, ctr: 22.78, position: 2.5 },
  { date: "2026-01-23", clicks: 18, impressions: 48, ctr: 37.5, position: 2.4 },
  { date: "2026-01-24", clicks: 3, impressions: 16, ctr: 18.75, position: 7.6 },
  { date: "2026-01-25", clicks: 4, impressions: 16, ctr: 25, position: 5.1 },
  { date: "2026-01-26", clicks: 15, impressions: 63, ctr: 23.81, position: 2.7 },
  { date: "2026-01-27", clicks: 16, impressions: 63, ctr: 25.4, position: 2.9 },
  { date: "2026-01-28", clicks: 14, impressions: 62, ctr: 22.58, position: 2.6 },
  { date: "2026-01-29", clicks: 15, impressions: 43, ctr: 34.88, position: 3.1 },
  { date: "2026-01-30", clicks: 9, impressions: 39, ctr: 23.08, position: 3.5 },
  { date: "2026-01-31", clicks: 3, impressions: 15, ctr: 20, position: 5.3 },
  { date: "2026-02-01", clicks: 4, impressions: 19, ctr: 21.05, position: 3.6 },
  { date: "2026-02-02", clicks: 18, impressions: 51, ctr: 35.29, position: 2.8 },
  { date: "2026-02-03", clicks: 7, impressions: 44, ctr: 15.91, position: 2.7 },
  { date: "2026-02-04", clicks: 17, impressions: 46, ctr: 36.96, position: 3.3 },
  { date: "2026-02-05", clicks: 14, impressions: 57, ctr: 24.56, position: 3.5 },
  { date: "2026-02-06", clicks: 8, impressions: 36, ctr: 22.22, position: 3.5 },
  { date: "2026-02-07", clicks: 1, impressions: 11, ctr: 9.09, position: 5.1 },
  { date: "2026-02-08", clicks: 6, impressions: 16, ctr: 37.5, position: 2.6 },
  { date: "2026-02-09", clicks: 12, impressions: 52, ctr: 23.08, position: 3.6 },
  { date: "2026-02-10", clicks: 5, impressions: 54, ctr: 9.26, position: 3.3 },
  { date: "2026-02-11", clicks: 7, impressions: 27, ctr: 25.93, position: 2.6 },
  { date: "2026-02-12", clicks: 9, impressions: 42, ctr: 21.43, position: 3.6 },
  { date: "2026-02-13", clicks: 5, impressions: 33, ctr: 15.15, position: 2.7 },
  { date: "2026-02-14", clicks: 3, impressions: 14, ctr: 21.43, position: 4.1 },
  { date: "2026-02-15", clicks: 2, impressions: 16, ctr: 12.5, position: 1.8 },
  { date: "2026-02-16", clicks: 11, impressions: 39, ctr: 28.21, position: 2.6 },
  { date: "2026-02-17", clicks: 17, impressions: 62, ctr: 27.42, position: 2.9 },
  { date: "2026-02-18", clicks: 8, impressions: 54, ctr: 14.81, position: 3.4 },
  { date: "2026-02-19", clicks: 15, impressions: 51, ctr: 29.41, position: 2.4 },
  { date: "2026-02-20", clicks: 14, impressions: 51, ctr: 27.45, position: 2.5 },
  { date: "2026-02-21", clicks: 3, impressions: 17, ctr: 17.65, position: 1.8 },
  { date: "2026-02-22", clicks: 3, impressions: 27, ctr: 11.11, position: 2.3 },
  { date: "2026-02-23", clicks: 7, impressions: 37, ctr: 18.92, position: 4.8 },
  { date: "2026-02-24", clicks: 12, impressions: 36, ctr: 33.33, position: 2.6 },
  { date: "2026-02-25", clicks: 8, impressions: 38, ctr: 21.05, position: 2.6 },
  { date: "2026-02-26", clicks: 5, impressions: 28, ctr: 17.86, position: 2.1 },
  { date: "2026-02-27", clicks: 8, impressions: 32, ctr: 25, position: 2.2 },
  { date: "2026-02-28", clicks: 3, impressions: 3, ctr: 100, position: 2.3 },
  { date: "2026-03-01", clicks: 4, impressions: 13, ctr: 30.77, position: 3.8 },
  { date: "2026-03-02", clicks: 8, impressions: 27, ctr: 29.63, position: 2.3 },
  { date: "2026-03-03", clicks: 13, impressions: 41, ctr: 31.71, position: 2.4 },
  { date: "2026-03-04", clicks: 12, impressions: 33, ctr: 36.36, position: 2.4 },
  { date: "2026-03-05", clicks: 12, impressions: 41, ctr: 29.27, position: 4.2 },
  { date: "2026-03-06", clicks: 4, impressions: 14, ctr: 28.57, position: 2.7 },
  { date: "2026-03-07", clicks: 3, impressions: 6, ctr: 50, position: 1 },
  { date: "2026-03-08", clicks: 2, impressions: 5, ctr: 40, position: 2 },
  { date: "2026-03-09", clicks: 12, impressions: 31, ctr: 38.71, position: 2.6 },
  { date: "2026-03-10", clicks: 13, impressions: 49, ctr: 26.53, position: 2 },
  { date: "2026-03-11", clicks: 9, impressions: 49, ctr: 18.37, position: 1.9 },
  { date: "2026-03-12", clicks: 10, impressions: 43, ctr: 23.26, position: 2.7 },
  { date: "2026-03-13", clicks: 17, impressions: 53, ctr: 32.08, position: 2.2 },
  { date: "2026-03-14", clicks: 5, impressions: 27, ctr: 18.52, position: 2.5 },
  { date: "2026-03-15", clicks: 9, impressions: 32, ctr: 28.12, position: 2.4 },
  { date: "2026-03-16", clicks: 15, impressions: 54, ctr: 27.78, position: 2.9 },
  { date: "2026-03-17", clicks: 16, impressions: 50, ctr: 32, position: 2.4 },
  { date: "2026-03-18", clicks: 7, impressions: 48, ctr: 14.58, position: 2.4 },
  { date: "2026-03-19", clicks: 16, impressions: 46, ctr: 34.78, position: 2.1 },
  { date: "2026-03-20", clicks: 8, impressions: 39, ctr: 20.51, position: 3.9 },
  { date: "2026-03-21", clicks: 8, impressions: 19, ctr: 42.11, position: 3.5 },
  { date: "2026-03-22", clicks: 4, impressions: 18, ctr: 22.22, position: 2.7 },
  { date: "2026-03-23", clicks: 13, impressions: 82, ctr: 15.85, position: 2.4 },
  { date: "2026-03-24", clicks: 22, impressions: 150, ctr: 14.67, position: 6.8 },
  { date: "2026-03-25", clicks: 23, impressions: 260, ctr: 8.85, position: 9.8 },
  { date: "2026-03-26", clicks: 26, impressions: 258, ctr: 10.08, position: 9.6 },
  { date: "2026-03-27", clicks: 21, impressions: 253, ctr: 8.3, position: 9.1 },
  { date: "2026-03-28", clicks: 6, impressions: 123, ctr: 4.88, position: 12.6 },
  { date: "2026-03-29", clicks: 4, impressions: 126, ctr: 3.17, position: 15.5 },
  { date: "2026-03-30", clicks: 24, impressions: 298, ctr: 8.05, position: 8.8 },
  { date: "2026-03-31", clicks: 21, impressions: 252, ctr: 8.33, position: 9.5 },
  { date: "2026-04-01", clicks: 28, impressions: 260, ctr: 10.77, position: 8.3 },
  { date: "2026-04-02", clicks: 19, impressions: 345, ctr: 5.51, position: 11.2 },
  { date: "2026-04-03", clicks: 12, impressions: 197, ctr: 6.09, position: 12.4 },
  { date: "2026-04-04", clicks: 7, impressions: 105, ctr: 6.67, position: 12.4 },
  { date: "2026-04-05", clicks: 9, impressions: 159, ctr: 5.66, position: 11.5 },
  { date: "2026-04-06", clicks: 8, impressions: 213, ctr: 3.76, position: 10.1 },
  { date: "2026-04-07", clicks: 24, impressions: 282, ctr: 8.51, position: 11.6 },
  { date: "2026-04-08", clicks: 20, impressions: 267, ctr: 7.49, position: 10.9 },
  { date: "2026-04-09", clicks: 19, impressions: 320, ctr: 5.94, position: 12.2 },
  { date: "2026-04-10", clicks: 27, impressions: 266, ctr: 10.15, position: 11.8 },
  { date: "2026-04-11", clicks: 6, impressions: 273, ctr: 2.2, position: 10.3 },
  { date: "2026-04-12", clicks: 13, impressions: 314, ctr: 4.14, position: 14 },
  { date: "2026-04-13", clicks: 38, impressions: 616, ctr: 6.17, position: 10.3 },
  { date: "2026-04-14", clicks: 26, impressions: 636, ctr: 4.09, position: 13.9 },
  { date: "2026-04-15", clicks: 33, impressions: 614, ctr: 5.37, position: 14.2 },
  { date: "2026-04-16", clicks: 31, impressions: 696, ctr: 4.45, position: 12 },
  { date: "2026-04-17", clicks: 34, impressions: 559, ctr: 6.08, position: 13.1 },
  { date: "2026-04-18", clicks: 18, impressions: 456, ctr: 3.95, position: 14.1 },
  { date: "2026-04-19", clicks: 12, impressions: 460, ctr: 2.61, position: 13.6 },
  { date: "2026-04-20", clicks: 29, impressions: 628, ctr: 4.62, position: 11.4 },
];

// ─── Top requêtes ────────────────────────────────────────────

export const gscTopQueries: GscQueryRow[] = [
  { query: "novadev", clicks: 498, impressions: 1439, ctr: 34.61, position: 1.82 },
  { query: "novadev paris", clicks: 63, impressions: 183, ctr: 34.43, position: 1.84 },
  { query: "novadev avis", clicks: 61, impressions: 274, ctr: 22.26, position: 1.61 },
  { query: "centre novadev", clicks: 27, impressions: 92, ctr: 29.35, position: 1.47 },
  { query: "avis sur novadev", clicks: 25, impressions: 149, ctr: 16.78, position: 1.68 },
  { query: "novadev centre de santé", clicks: 18, impressions: 64, ctr: 28.12, position: 1.84 },
  { query: "centre de santé novadev", clicks: 17, impressions: 53, ctr: 32.08, position: 1.42 },
  { query: "nova dev", clicks: 12, impressions: 53, ctr: 22.64, position: 1.53 },
  { query: "novadev photos", clicks: 5, impressions: 17, ctr: 29.41, position: 1.35 },
  { query: "childwell", clicks: 4, impressions: 26, ctr: 15.38, position: 6.85 },
  { query: "valentine ducharne", clicks: 2, impressions: 8, ctr: 25, position: 2.88 },
  { query: "novadev paris 17", clicks: 2, impressions: 4, ctr: 50, position: 1.25 },
  { query: "diagnostic tdah paris", clicks: 1, impressions: 52, ctr: 1.92, position: 8.88 },
  { query: "15 rue beudant 75017 paris", clicks: 1, impressions: 34, ctr: 2.94, position: 3.68 },
  { query: "bilan tdah paris", clicks: 1, impressions: 20, ctr: 5, position: 7.7 },
  { query: "centre diagnostic tdah enfant paris", clicks: 1, impressions: 14, ctr: 7.14, position: 10 },
  { query: "bilan tsa paris", clicks: 1, impressions: 10, ctr: 10, position: 10.2 },
  { query: "centre neuro développement", clicks: 1, impressions: 8, ctr: 12.5, position: 11.5 },
  { query: "diagnostic tdah enfant paris", clicks: 1, impressions: 6, ctr: 16.67, position: 10.17 },
  { query: "diagnostic tsa paris", clicks: 1, impressions: 5, ctr: 20, position: 9.8 },
  { query: "aesh", clicks: 0, impressions: 266, ctr: 0, position: 17.9 },
  { query: "haut potentiel intellectuel", clicks: 0, impressions: 157, ctr: 0, position: 15.24 },
  { query: "diagnostic différentiel", clicks: 0, impressions: 92, ctr: 0, position: 11.38 },
  { query: "tdc signification", clicks: 0, impressions: 76, ctr: 0, position: 7.95 },
  { query: "tdc", clicks: 0, impressions: 68, ctr: 0, position: 14.03 },
  { query: "diagnostic différentiel def", clicks: 0, impressions: 58, ctr: 0, position: 10.31 },
  { query: "neurodev paris", clicks: 0, impressions: 43, ctr: 0, position: 9.4 },
  { query: "dys", clicks: 0, impressions: 41, ctr: 0, position: 37.61 },
  { query: "inattention", clicks: 0, impressions: 37, ctr: 0, position: 5.92 },
  { query: "tdah", clicks: 0, impressions: 33, ctr: 0, position: 1.55 },
  { query: "tdah paris", clicks: 0, impressions: 21, ctr: 0, position: 13.76 },
  { query: "test tdah paris", clicks: 0, impressions: 14, ctr: 0, position: 7.64 },
  { query: "centre tdah paris", clicks: 0, impressions: 12, ctr: 0, position: 10.92 },
  { query: "tdah c'est quoi", clicks: 0, impressions: 9, ctr: 0, position: 3 },
];

// ─── Top pages ───────────────────────────────────────────────

export const gscTopPages: GscPageRow[] = [
  { page: "https://novadev.care/", clicks: 894, impressions: 4030, ctr: 22.18, position: 3 },
  { page: "https://novadev.care/nous-contacter", clicks: 67, impressions: 1462, ctr: 4.58, position: 3.11 },
  { page: "https://novadev.care/notre-equipe", clicks: 27, impressions: 717, ctr: 3.77, position: 3.72 },
  { page: "https://novadev.care/mentions-legales", clicks: 23, impressions: 1998, ctr: 1.15, position: 3.14 },
  { page: "https://novadev.care/tdc", clicks: 18, impressions: 1078, ctr: 1.67, position: 7.88 },
  { page: "https://novadev.care/diagnostic-tdah/montrouge", clicks: 16, impressions: 660, ctr: 2.42, position: 3.02 },
  { page: "https://novadev.care/contact", clicks: 15, impressions: 752, ctr: 1.99, position: 3.88 },
  { page: "https://novadev.care/diagnostic-tdah/paris", clicks: 12, impressions: 530, ctr: 2.26, position: 7.49 },
  { page: "https://novadev.care/tdah/enfant-7-ans", clicks: 12, impressions: 164, ctr: 7.32, position: 7.8 },
  { page: "https://novadev.care/tdah/tdah-adolescent", clicks: 7, impressions: 122, ctr: 5.74, position: 9.17 },
  { page: "https://novadev.care/diagnostic-tsa/paris", clicks: 5, impressions: 193, ctr: 2.59, position: 6.84 },
  { page: "https://novadev.care/diagnostic-tdah/boulogne-billancourt", clicks: 5, impressions: 170, ctr: 2.94, position: 8.55 },
  { page: "https://novadev.care/tdah/enfant-6-ans", clicks: 4, impressions: 119, ctr: 3.36, position: 8.88 },
  { page: "https://novadev.care/diagnostic-tdah/vincennes", clicks: 4, impressions: 107, ctr: 3.74, position: 4.85 },
  { page: "https://novadev.care/tdah/enfant-10-ans", clicks: 4, impressions: 58, ctr: 6.9, position: 6.28 },
  { page: "https://novadev.care/tdc/enfant-6-ans", clicks: 4, impressions: 22, ctr: 18.18, position: 11.45 },
  { page: "https://novadev.care/tdah", clicks: 3, impressions: 672, ctr: 0.45, position: 8.44 },
  { page: "https://novadev.care/diagnostic-tdc/paris", clicks: 3, impressions: 128, ctr: 2.34, position: 5.09 },
  { page: "https://novadev.care/diagnostic-tdc/boulogne-billancourt", clicks: 3, impressions: 26, ctr: 11.54, position: 8.35 },
  { page: "https://novadev.care/tsa", clicks: 2, impressions: 689, ctr: 0.29, position: 7.27 },
  { page: "https://novadev.care/glossaire/definition-diagnostic-diff-rentiel", clicks: 2, impressions: 391, ctr: 0.51, position: 8.91 },
  { page: "https://novadev.care/tdah/enfant-5-ans", clicks: 2, impressions: 134, ctr: 1.49, position: 9.04 },
  { page: "https://novadev.care/diagnostic-tsa/boulogne-billancourt", clicks: 2, impressions: 105, ctr: 1.9, position: 8.18 },
  { page: "https://novadev.care/diagnostic-tdah/issy-les-moulineaux", clicks: 2, impressions: 51, ctr: 3.92, position: 7.94 },
  { page: "https://novadev.care/tdc/tdc-adolescent", clicks: 2, impressions: 38, ctr: 5.26, position: 9.29 },
  { page: "https://novadev.care/diagnostic-tdah/levallois-perret", clicks: 2, impressions: 31, ctr: 6.45, position: 6.1 },
  { page: "https://novadev.care/glossaire/definition-difficult-s-scolaires", clicks: 2, impressions: 30, ctr: 6.67, position: 9 },
  { page: "https://novadev.care/diagnostic-tsa/vincennes", clicks: 2, impressions: 23, ctr: 8.7, position: 7.22 },
  { page: "https://novadev.care/tdc/enfant-7-ans", clicks: 2, impressions: 13, ctr: 15.38, position: 5.85 },
  { page: "https://novadev.care/faq", clicks: 1, impressions: 342, ctr: 0.29, position: 3.44 },
  { page: "https://novadev.care/notre-bilan", clicks: 1, impressions: 182, ctr: 0.55, position: 5.75 },
  { page: "https://novadev.care/notre-evaluation", clicks: 1, impressions: 109, ctr: 0.92, position: 4.12 },
  { page: "https://novadev.care/glossaire/definition-bilan-neuropsychologique", clicks: 1, impressions: 107, ctr: 0.93, position: 38.44 },
  { page: "https://novadev.care/glossaire/definition-hpi-haut-potentiel-intellectuel", clicks: 0, impressions: 468, ctr: 0, position: 22.52 },
  { page: "https://novadev.care/glossaire/definition-aesh-accompagnant-d-l-ve-en-situation-de-handicap", clicks: 0, impressions: 410, ctr: 0, position: 17.18 },
  { page: "https://novadev.care/glossaire/definition-pap-plan-daccompagnement-personnalis", clicks: 0, impressions: 177, ctr: 0, position: 11.15 },
  { page: "https://novadev.care/glossaire/definition-anamn-se", clicks: 0, impressions: 160, ctr: 0, position: 31.54 },
  { page: "https://novadev.care/glossaire/definition-inattention", clicks: 0, impressions: 116, ctr: 0, position: 6.64 },
  { page: "https://novadev.care/tdah/enfant", clicks: 0, impressions: 111, ctr: 0, position: 13.38 },
  { page: "https://novadev.care/glossaire/definition-impulsivit", clicks: 0, impressions: 107, ctr: 0, position: 7.37 },
  { page: "https://novadev.care/glossaire/definition-troubles-dys", clicks: 0, impressions: 106, ctr: 0, position: 43.72 },
  { page: "https://novadev.care/glossaire/definition-valuation-du-qi", clicks: 0, impressions: 100, ctr: 0, position: 21.39 },
  { page: "https://novadev.care/diagnostic-tdc/montrouge", clicks: 0, impressions: 83, ctr: 0, position: 2.6 },
  { page: "https://novadev.care/glossaire/definition-pps-projet-personnalis-de-scolarisation", clicks: 0, impressions: 75, ctr: 0, position: 11.65 },
  { page: "https://novadev.care/glossaire/definition-test-wisc", clicks: 0, impressions: 72, ctr: 0, position: 20.94 },
  { page: "https://novadev.care/glossaire/definition-comorbidit-s", clicks: 0, impressions: 63, ctr: 0, position: 38.08 },
  { page: "https://novadev.care/glossaire/definition-tdl-trouble-d-veloppemental-du-langage", clicks: 0, impressions: 59, ctr: 0, position: 11.88 },
  { page: "https://novadev.care/glossaire/definition-tsa-troubles-du-spectre-autistique", clicks: 0, impressions: 59, ctr: 0, position: 44.14 },
  { page: "https://novadev.care/glossaire/definition-tnd-troubles-neurod-veloppementaux", clicks: 0, impressions: 56, ctr: 0, position: 52.89 },
];

// ─── Helpers pour formater en format API-compatible ──────────

export function getStaticPerformanceData(startDate?: string, endDate?: string) {
  let rows = gscDailyData;
  if (startDate) rows = rows.filter((r) => r.date >= startDate);
  if (endDate) rows = rows.filter((r) => r.date <= endDate);

  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const averageCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const averagePosition = rows.length > 0 ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;

  return {
    rows: rows.map((r) => ({
      keys: [r.date],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr / 100,
      position: r.position,
    })),
    totalClicks,
    totalImpressions,
    averageCtr,
    averagePosition,
  };
}

export function getStaticTopQueries(limit = 10) {
  return gscTopQueries.slice(0, limit).map((q) => ({
    keys: [q.query],
    clicks: q.clicks,
    impressions: q.impressions,
    ctr: q.ctr / 100,
    position: q.position,
  }));
}

export function getStaticTopPages(limit = 20) {
  return gscTopPages.slice(0, limit).map((p) => ({
    keys: [p.page],
    clicks: p.clicks,
    impressions: p.impressions,
    ctr: p.ctr / 100,
    position: p.position,
  }));
}
