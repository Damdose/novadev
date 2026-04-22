-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CampaignContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailOpened" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "openedAt" DATETIME,
    CONSTRAINT "CampaignContact_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "averageScore" REAL NOT NULL,
    "recommendation" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT NOT NULL DEFAULT '',
    "isPositive" BOOLEAN NOT NULL,
    "redirectedToGoogle" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyResponse_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SurveyResponse_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "googleUrl" TEXT NOT NULL DEFAULT 'https://share.google/igfsYUvospskPEr9k',
    "threshold" REAL NOT NULL DEFAULT 3,
    "positiveTitle" TEXT NOT NULL DEFAULT 'Merci pour votre retour !',
    "positiveMessage" TEXT NOT NULL DEFAULT 'Votre experience a ete positive ! Partagez votre avis sur Google pour aider d''autres parents a decouvrir Novadev.',
    "negativeMessage" TEXT NOT NULL DEFAULT 'Nous avons bien note vos remarques. Notre equipe les examinera avec attention pour ameliorer votre prochaine experience.',
    "buttonText" TEXT NOT NULL DEFAULT 'Laisser un avis Google',
    "senderName" TEXT NOT NULL DEFAULT 'Novadev',
    "senderEmail" TEXT NOT NULL DEFAULT 'contact@novadev.care',
    "questions" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "WeeklyKpi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "messagesWebflow" INTEGER NOT NULL DEFAULT 0,
    "appelsCentre" INTEGER NOT NULL DEFAULT 0,
    "rdvDoctolib" INTEGER NOT NULL DEFAULT 0,
    "messagesDoctolib" INTEGER NOT NULL DEFAULT 0,
    "traficSite" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignContact_campaignId_contactId_key" ON "CampaignContact"("campaignId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyKpi_weekStart_key" ON "WeeklyKpi"("weekStart");
