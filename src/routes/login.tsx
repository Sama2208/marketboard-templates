import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/marketboard/BrandMark";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Kirish — MarketBoard" },
      {
        name: "description",
        content: "MarketBoard hisobingizga email va parol orqali kiring yoki yangi hisob yarating.",
      },
      { property: "og:title", content: "Kirish — MarketBoard" },
      {
        property: "og:description",
        content: "MarketBoard shablonlaridan foydalanish uchun hisobingizga kiring.",
      },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "register";

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Login qilgan foydalanuvchini RNP sahifasiga yo'naltirish
  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/templates/rnp", replace: true });
    }
  }, [loading, session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError("Supabase sozlamalari topilmadi. Environment variable'larni to'ldirish kerak.");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (err) throw err;
        if (data.session) {
          navigate({ to: "/templates/rnp", replace: true });
        } else {
          setInfo(
            "Hisob yaratildi. Emailingizga tasdiqlash havolasi yuborildi — havolani bosgandan so'ng shu sahifadan kiring.",
          );
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate({ to: "/templates/rnp", replace: true });
      }
    } catch (err) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Asosiy sahifa
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
          <div className="hero-glow card-surface hidden flex-col justify-between p-8 lg:flex">
            <div>
              <BrandMark />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                MarketBoard workspace
              </p>
              <h1 className="mt-4 max-w-md font-display text-4xl font-bold leading-tight">
                Raqamlarni <span className="text-gradient">aniq qarorlarga</span> aylantiring.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Funnel, budjet, hisobot va kontent rejasini bitta ish stolida saqlang.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-card/50 p-4">
                <strong className="block text-foreground">5 ta vosita</strong>
                <span className="mt-1 block text-xs">Tayyor marketing oqimlari</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-card/50 p-4">
                <strong className="block text-foreground">Bir workspace</strong>
                <span className="mt-1 block text-xs">Mijoz ishlarini tartiblang</span>
              </div>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8">
            <BrandMark className="lg:hidden" />
            <h2 className="mt-5 font-display text-2xl font-bold">
              {mode === "login" ? "Hisobingizga kirish" : "Yangi hisob yaratish"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Shablonlardan foydalanish uchun email va parolingizni kiriting."
                : "Email va parol kiriting — hisob bir daqiqada tayyor bo'ladi."}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="siz@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Parol
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Kamida 6 belgi"
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}
              {info ? (
                <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
                  {info}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
                setInfo(null);
              }}
              className="mt-5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {mode === "login"
                ? "Hisobingiz yo'qmi? Ro'yxatdan o'tish"
                : "Hisobingiz bormi? Kirish"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function translateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email yoki parol xato.";
  if (m.includes("is invalid") || m.includes("invalid email") || m.includes("email address"))
    return "Email manzil noto'g'ri yoki qabul qilinmaydi. Boshqa email kiriting.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "Ro'yxatdan o'tish vaqtincha o'chirilgan. Administrator bilan bog'laning.";
  if (m.includes("email not confirmed"))
    return "Email hali tasdiqlanmagan. Pochtangizdagi tasdiqlash havolasini bosing.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Bu email allaqachon ro'yxatdan o'tgan. Kirishga urinib ko'ring.";
  if (m.includes("password")) return "Parol juda qisqa yoki mos emas (kamida 6 belgi).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Juda ko'p urinish. Bir necha daqiqadan so'ng qayta urinib ko'ring.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
  return msg;
}
