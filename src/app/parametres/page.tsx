"use client";

import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Link2,
  Mail,
  Star,
  Save,
  MessageSquare,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  FileSpreadsheet,
  Eye,
  ExternalLink,
} from "lucide-react";
import { SURVEY_QUESTIONS, POSITIVE_THRESHOLD } from "@/lib/types";
import { Contact } from "@/lib/types";
import { mockContacts } from "@/lib/mock-data";
import Papa from "papaparse";

export default function SettingsPage() {
  // Questions state
  const [questions, setQuestions] = useState(
    SURVEY_QUESTIONS.map((q) => ({ id: q.id, text: q.text }))
  );

  // Destination page state
  const [googleUrl, setGoogleUrl] = useState("https://g.page/r/novadev/review");
  const [threshold, setThreshold] = useState(String(POSITIVE_THRESHOLD));
  const [positiveTitle, setPositiveTitle] = useState("Merci pour votre retour !");
  const [positiveMessage, setPositiveMessage] = useState(
    "Votre expérience a été positive ! Partagez votre avis sur Google pour aider d'autres parents à découvrir Novadev."
  );
  const [negativeMessage, setNegativeMessage] = useState(
    "Nous avons bien noté vos remarques. Notre équipe les examinera avec attention pour améliorer votre prochaine expérience."
  );
  const [buttonText, setButtonText] = useState("Laisser un avis Google");

  // Email config state
  const [senderName, setSenderName] = useState("Novadev");
  const [senderEmail, setSenderEmail] = useState("contact@novadev.care");

  // CSV Import state
  const [importedContacts, setImportedContacts] = useState<Contact[]>(mockContacts);
  const [importPreview, setImportPreview] = useState<Partial<Contact>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], text: value };
    setQuestions(updated);
  };

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setQuestions([...questions, { id: newId, text: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as Record<string, string>[]).map((row) => ({
          firstName: row.prenom || row.firstName || row["Prénom"] || row.Prenom || "",
          lastName: row.nom || row.lastName || row.Nom || "",
          email: row.email || row.Email || row.mail || row.Mail || "",
          phone: row.telephone || row.phone || row["Téléphone"] || row.Phone || "",
        }));
        setImportPreview(parsed.filter((p) => p.email));
      },
    });
  };

  const confirmImport = () => {
    const newContacts: Contact[] = importPreview.map((p, i) => ({
      id: String(importedContacts.length + i + 1),
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      email: p.email || "",
      phone: p.phone,
      importedAt: new Date().toISOString().split("T")[0],
      status: "pending" as const,
    }));
    setImportedContacts([...importedContacts, ...newContacts]);
    setImportPreview([]);
  };

  const deleteContact = (id: string) => {
    setImportedContacts(importedContacts.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Configurez votre outil de collecte d&apos;avis
          </p>
        </div>

        <Tabs defaultValue="questions">
          <TabsList>
            <TabsTrigger value="questions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="destination" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Page de destination
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Onglet Questions */}
          <TabsContent value="questions" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Questions du questionnaire
                    </CardTitle>
                    <Badge variant="secondary">{questions.length} questions</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-3 group">
                      <div className="flex items-center gap-2 mt-2.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Input
                          value={q.text}
                          onChange={(e) => updateQuestion(i, e.target.value)}
                          placeholder="Saisissez votre question..."
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(i)}
                        className="mt-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={questions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une question
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Chaque question sera notée de 1 à 5 étoiles par le patient.
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer les questions
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Page de destination */}
          <TabsContent value="destination" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Redirection Google Avis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL de votre page Google Avis</Label>
                    <Input
                      placeholder="https://g.page/r/votre-lien/review"
                      value={googleUrl}
                      onChange={(e) => setGoogleUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texte du bouton de redirection</Label>
                    <Input
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil de satisfaction (sur 5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="w-24"
                    />
                    <p className="text-xs text-muted-foreground">
                      Les réponses avec une moyenne &ge; {threshold}/5 seront
                      redirigées vers Google Avis
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Message pour les avis positifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre de la page</Label>
                    <Input
                      value={positiveTitle}
                      onChange={(e) => setPositiveTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message d&apos;encouragement</Label>
                    <Textarea
                      value={positiveMessage}
                      onChange={(e) => setPositiveMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message pour les avis négatifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message de prise en compte</Label>
                    <Textarea
                      value={negativeMessage}
                      onChange={(e) => setNegativeMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Aperçu de la page
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl p-6 bg-gradient-to-b from-primary/5 to-white space-y-4">
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-emerald-50 p-3">
                          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold">{positiveTitle}</h3>
                    </div>
                    <div className="rounded-lg border bg-amber-50/50 border-amber-200/50 p-3 text-center space-y-1">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{positiveMessage}</p>
                    </div>
                    <div className="text-center">
                      <Button size="sm" className="gap-2">
                        <Star className="h-3 w-3" />
                        {buttonText}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer la page de destination
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Import CSV */}
          <TabsContent value="import" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Importer des contacts
                    </CardTitle>
                    <Badge variant="secondary">{importedContacts.length} contacts</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {importPreview.length === 0 ? (
                    <div
                      className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Glissez votre fichier CSV ici</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Colonnes attendues : <code className="bg-muted px-1 py-0.5 rounded">prenom</code>, <code className="bg-muted px-1 py-0.5 rounded">nom</code>, <code className="bg-muted px-1 py-0.5 rounded">email</code>, <code className="bg-muted px-1 py-0.5 rounded">telephone</code>
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {importPreview.length} contacts trouvés
                        </p>
                        <Badge variant="secondary">Aperçu</Badge>
                      </div>
                      <div className="border rounded-lg max-h-64 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left p-3 font-medium">Prénom</th>
                              <th className="text-left p-3 font-medium">Nom</th>
                              <th className="text-left p-3 font-medium">Email</th>
                              <th className="text-left p-3 font-medium">Téléphone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.slice(0, 10).map((c, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-3">{c.firstName}</td>
                                <td className="p-3">{c.lastName}</td>
                                <td className="p-3 text-muted-foreground">{c.email}</td>
                                <td className="p-3 text-muted-foreground">{c.phone || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {importPreview.length > 10 && (
                          <p className="text-xs text-muted-foreground p-3 text-center border-t">
                            ... et {importPreview.length - 10} autres contacts
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setImportPreview([])}>
                          Annuler
                        </Button>
                        <Button onClick={confirmImport} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Importer {importPreview.length} contacts
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {importedContacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Contacts importés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 font-medium">Nom</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Téléphone</th>
                            <th className="text-left p-3 font-medium">Importé le</th>
                            <th className="text-right p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedContacts.map((contact) => (
                            <tr key={contact.id} className="border-t hover:bg-muted/30 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </div>
                                  <span className="font-medium">
                                    {contact.firstName} {contact.lastName}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">{contact.email}</td>
                              <td className="p-3 text-muted-foreground">{contact.phone || "—"}</td>
                              <td className="p-3 text-muted-foreground">{contact.importedAt}</td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteContact(contact.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Onglet Email */}
          <TabsContent value="email" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Configuration email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom de l&apos;expéditeur</Label>
                      <Input
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email de l&apos;expéditeur</Label>
                      <Input
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le service d&apos;envoi d&apos;emails sera configuré ultérieurement
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer la configuration email
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
