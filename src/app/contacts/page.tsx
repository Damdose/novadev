"use client";

import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Plus,
  Search,
  Trash2,
  Download,
  Users,
  Mail,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { Contact } from "@/lib/types";
import { mockContacts } from "@/lib/mock-data";
import Papa from "papaparse";

const statusConfig: Record<
  Contact["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }
> = {
  pending: { label: "En attente", variant: "outline", icon: Clock },
  sent: { label: "Envoyé", variant: "secondary", icon: Mail },
  opened: { label: "Ouvert", variant: "default", icon: Mail },
  completed: { label: "Répondu", variant: "default", icon: CheckCircle2 },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Contact>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as Record<string, string>[]).map((row) => ({
          firstName: row.prenom || row.firstName || row.Prénom || row.Prenom || "",
          lastName: row.nom || row.lastName || row.Nom || "",
          email: row.email || row.Email || row.mail || row.Mail || "",
          phone: row.telephone || row.phone || row.Téléphone || row.Phone || "",
        }));
        setImportPreview(parsed.filter((p: Partial<Contact>) => p.email));
      },
    });
  };

  const confirmImport = () => {
    const newContacts: Contact[] = importPreview.map((p, i) => ({
      id: String(contacts.length + i + 1),
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      email: p.email || "",
      phone: p.phone,
      importedAt: new Date().toISOString().split("T")[0],
      status: "pending" as const,
    }));
    setContacts([...contacts, ...newContacts]);
    setImportPreview([]);
    setShowImport(false);
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre liste de contacts pour les campagnes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Dialog open={showImport} onOpenChange={setShowImport}>
              <DialogTrigger render={<Button className="gap-2" />}>
                  <Upload className="h-4 w-4" />
                  Importer CSV
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importer des contacts</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {importPreview.length === 0 ? (
                    <div
                      className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">
                        Glissez votre fichier CSV ici
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Colonnes attendues : prenom, nom, email, telephone
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
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImportPreview([]);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button onClick={confirmImport} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Importer {importPreview.length} contacts
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                {filteredContacts.length} contact{filteredContacts.length > 1 ? "s" : ""}
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un contact..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Nom</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Téléphone</th>
                    <th className="text-left p-3 font-medium">Importé le</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => {
                    const status = statusConfig[contact.status];
                    return (
                      <tr key={contact.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {contact.firstName[0]}
                              {contact.lastName[0]}
                            </div>
                            <span className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{contact.email}</td>
                        <td className="p-3 text-muted-foreground">{contact.phone || "—"}</td>
                        <td className="p-3 text-muted-foreground">{contact.importedAt}</td>
                        <td className="p-3">
                          <Badge variant={status.variant} className="gap-1 text-[11px]">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
