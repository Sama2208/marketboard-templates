import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/marketboard/BrandMark";
import { TemplateGallery } from "@/components/marketboard/TemplateGallery";
import { PricingSection } from "@/components/marketboard/PricingSection";
import { useAuth } from "@/hooks/use-auth";

function AuthNavButton() {
  const { session, loading } = useAuth();
  if (loading) {
    return <span className="h-9 w-24 rounded-lg border border-border bg-secondary/40" />;
  }
  return session ? (
    <Link
      to="/templates/rnp"
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
    >
      Ish stoli
    </Link>
  ) : (
    <Link
      to="/login"
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
    >
      Kirish
    </Link>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketBoard — Marketing shablonlari platformasi" },
      {
        name: "description",
        content:
          "MarketBoard — marketologlar va agentliklar uchun tayyor marketing shablonlari: funnel tracker, kalkulyatorlar, hisobotlar.",
      },
      { property: "og:title", content: "MarketBoard — Marketing shablonlari platformasi" },
      {
        property: "og:description",
        content: "Meta Ads funnel, budjet va hisobot shablonlari — bir joyda.",
      },
      { name: "theme-color", content: "#101827" },
      { name: "application-name", content: "MarketBoard" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Layers,
    title: "Tayyor shablonlar",
    text: "Klinika, ko'chmas mulk, mehmonxona, ta'lim va lokal biznes uchun vositalar.",
  },
  {
    icon: BarChart3,
    title: "Plan / Fakt nazorati",
    text: "Kunlik ma'lumot kiritasiz — indekslar, CPL va CPQL avtomatik hisoblanadi.",
  },
  {
    icon: Sparkles,
    title: "Toza va tez",
    text: "Ortiqcha sozlash yo'q. Brauzerda ishlaydi, ma'lumot saqlanib qoladi.",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <BrandMark />
        <div className="flex items-center gap-2">
          <a
            href="#shablonlar"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            Shablonlar
          </a>
          <a
            href="#tariflar"
            className="hidden rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground sm:inline-flex"
          >
            Tariflar
          </a>
          <AuthNavButton />
        </div>
      </header>

      <section className="hero-glow">
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs text-muted-foreground">
            Marketologlar va agentliklar uchun
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            Marketing ishlarini <span className="text-gradient">tezroq va aniqroq</span> boshqaring
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            RNP funnel, budjet, KPI va kontent rejasini bitta toza ish stolida boshqaring. Tayyor
            shablonlar bilan raqamlarni qarorga aylantiring.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/templates/rnp"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Boshlash <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="#shablonlar"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-accent"
            >
              Shablonlarni ko'rish
            </a>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 px-4 py-4 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold text-primary">4</p>
              <p className="mt-1 text-xs text-muted-foreground">Marketing shabloni</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 px-4 py-4 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold text-success">100%</p>
              <p className="mt-1 text-xs text-muted-foreground">Avtomatik KPI hisob</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 px-4 py-4 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold text-warning">UZ</p>
              <p className="mt-1 text-xs text-muted-foreground">O'zbekcha interfeys</p>
            </div>
          </div>

          <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-surface group p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant"
              >
                <f.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-sm font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TemplateGallery />
      <PricingSection />

      <footer className="border-t border-border bg-card/30 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
          <div>
            <BrandMark />
            <p className="mt-2 text-xs text-muted-foreground">
              Marketing raqamlarini bitta ish stolida.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> Ma'lumotlaringiz hisobingizga
            bog'langan
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MarketBoard</p>
        </div>
      </footer>
    </main>
  );
}
