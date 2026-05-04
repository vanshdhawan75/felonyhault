import { useState } from "react";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZentivo } from "@/lib/zentivo-context";
import { toast } from "sonner";
import type { Contact } from "@/lib/types";

export default function Contacts() {
  const { contacts, addContact, updateContact, removeContact } = useZentivo();
  const [editing, setEditing] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setEditing(null);
    setName("");
    setPhone("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (editing) {
      updateContact(editing.id, { name, phone });
      toast.success("Contact updated");
    } else {
      addContact({ name, phone });
      toast.success("Contact added");
    }
    reset();
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Escalation</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Emergency Contacts</h1>
        <p className="text-muted-foreground text-sm mt-2">Notified automatically when an alert is escalated.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="glass-card p-6 lg:col-span-1 h-fit space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-danger" />
            <h2 className="font-display font-semibold">{editing ? "Edit contact" : "Add contact"}</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cname">Name</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cphone">Phone</Label>
            <Input id="cphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0100" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-gradient-danger shadow-danger hover:opacity-95">
              <Plus className="h-4 w-4 mr-1" />
              {editing ? "Save" : "Add"}
            </Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {contacts.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">No contacts yet. Add one to enable escalation.</div>
          )}
          {contacts.map((c) => (
            <div key={c.id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center font-semibold">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">{c.phone}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setName(c.name); setPhone(c.phone); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { removeContact(c.id); toast.success("Removed"); }}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
