import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZentivo } from "@/lib/zentivo-context";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useZentivo();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err =
      mode === "signup"
        ? signup({ name, email, password })
        : login(email, password);
    if (err) return toast.error(err);
    toast.success(mode === "signup" ? "Account created" : "Welcome back");
    navigate("/");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border bg-card/40 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-danger/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-danger grid place-items-center shadow-danger">
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">Zentivo</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            AI-assisted safety, <span className="text-danger">always on</span>.
          </h2>
          <p className="text-muted-foreground">
            Continuous monitoring of motion, heart rate, and location — escalating help only when you can't.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Real-time risk classification", "Automatic emergency contact escalation", "Location-aware alerting"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="stat-dot bg-danger" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">© 2026 Zentivo Safety Systems</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "login" ? "Resume monitoring instantly." : "Set up safety in under a minute."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full bg-gradient-danger shadow-danger hover:opacity-95" size="lg">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {mode === "login" ? "New to Zentivo?" : "Already have an account?"}{" "}
            <button
              className="text-foreground underline-offset-4 hover:underline font-medium"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
